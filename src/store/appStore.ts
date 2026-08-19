import { loadScalars, saveLocale, saveProfile } from '@/db/localScalars'
import { type PersistenceState, requestPersistentStorage } from '@/db/persistence'
import * as repo from '@/db/repo'
import type { WriteFailure } from '@/db/repo'
import { assertNote } from '@/domain/constraints'
import { dateToDayKey } from '@/domain/dates'
import type { Note, Profile } from '@/domain/types'
import { type AppLocale, detectLocale } from '@/lib/i18n'
import i18next from '@/lib/i18n'
import { noteId } from '@/lib/id'
import { create } from 'zustand'

/**
 * The single store. Components never touch Dexie or localStorage; they call an
 * action here and read through a selector.
 *
 * Two things in this file are load-bearing and worth keeping when you replace
 * `Note` with your own entities:
 *
 * 1. **Startup is a state machine, not a boolean.** A plain `hydrated` flag can
 *    only say "not done yet", which is indistinguishable from "failed" and
 *    leaves the app on the splash screen forever. `hydrateStatus` lets `App`
 *    offer a retry.
 * 2. **Writes update memory first and disk second, and a disk failure is
 *    surfaced, not rolled back.** The record stays on screen and the user is
 *    told it did not save — see `src/db/repo.ts` for why.
 */
export type HydrateStatus = 'idle' | 'loading' | 'ready' | 'error'

export interface AppState {
  hydrateStatus: HydrateStatus
  hydrateError: string | null
  /**
   * Most recent write that did not reach disk. The record stays in memory, so
   * this means "shown but not saved" — the user needs to know before they close
   * the tab. The shell renders it as a toast and then dismisses it.
   */
  lastWriteError: WriteFailure | null
  persistence: PersistenceState

  locale: AppLocale
  profile: Profile
  notes: Note[]

  hydrate: () => Promise<void>
  dismissWriteError: () => void
  setLocale: (locale: AppLocale) => void
  setProfile: (patch: Partial<Profile>) => void
  completeOnboarding: (userName: string) => void

  addNote: (input: { title: string; body: string; date?: string }) => void
  updateNote: (id: string, patch: Partial<Omit<Note, 'id'>>) => void
  togglePin: (id: string) => void
  removeNote: (id: string) => void
}

export const useAppStore = create<AppState>((set, get) => ({
  hydrateStatus: 'idle',
  hydrateError: null,
  lastWriteError: null,
  persistence: { supported: false, persisted: false },

  locale: 'vi',
  profile: { userName: '', hasCompletedOnboarding: false },
  notes: [],

  async hydrate() {
    // Re-entrancy guard: StrictMode double-invokes effects in development, and
    // two concurrent hydrations would race to set the same arrays.
    if (get().hydrateStatus === 'loading') return
    set({ hydrateStatus: 'loading', hydrateError: null })

    repo.onWriteFailure((failure) => set({ lastWriteError: failure }))

    try {
      const scalars = loadScalars()
      const locale = detectLocale(scalars.locale)
      // `main.tsx` initialises i18n before render, so in the app this is only
      // ever a no-op or a real switch. The guard is for tests and for any host
      // that mounts the store without the bootstrap — an uninitialised i18next
      // rejects, and a language preference must not be able to fail startup.
      if (i18next.isInitialized && i18next.language !== locale) {
        await i18next.changeLanguage(locale)
      }

      const { notes } = await repo.loadAll()
      set({
        locale,
        profile: scalars.profile,
        notes: sortNotes(notes),
        hydrateStatus: 'ready',
      })
    } catch (err) {
      set({
        hydrateStatus: 'error',
        hydrateError: err instanceof Error ? err.message : String(err),
      })
      return
    }

    // Deliberately after `ready`: durability is a background concern and a
    // browser that prompts for it must not hold up the first paint.
    set({ persistence: await requestPersistentStorage() })
  },

  dismissWriteError: () => set({ lastWriteError: null }),

  setLocale(locale) {
    saveLocale(locale)
    void i18next.changeLanguage(locale)
    set({ locale })
  },

  setProfile(patch) {
    const profile = { ...get().profile, ...patch }
    saveProfile(profile)
    set({ profile })
  },

  completeOnboarding(userName) {
    get().setProfile({ userName: userName.trim(), hasCompletedOnboarding: true })
  },

  addNote({ title, body, date }) {
    const note: Note = {
      id: noteId(),
      title: title.trim(),
      body: body.trim(),
      date: date ?? dateToDayKey(new Date()),
      createdAt: Date.now(),
      pinned: false,
    }
    assertNote(note)
    repo.putNote(note)
    set({ notes: sortNotes([...get().notes, note]) })
  },

  updateNote(id, patch) {
    const current = get().notes.find((n) => n.id === id)
    if (!current) return
    const next = { ...current, ...patch, id }
    assertNote(next)
    repo.putNote(next)
    set({ notes: sortNotes(get().notes.map((n) => (n.id === id ? next : n))) })
  },

  togglePin(id) {
    const current = get().notes.find((n) => n.id === id)
    if (!current) return
    get().updateNote(id, { pinned: !current.pinned })
  },

  removeNote(id) {
    repo.deleteNote(id)
    set({ notes: get().notes.filter((n) => n.id !== id) })
  },
}))

/**
 * One canonical order, applied on every write, so no consumer ever sorts.
 * Pinned first, then newest day, then newest within the day.
 */
function sortNotes(notes: Note[]): Note[] {
  return [...notes].sort((a, b) => {
    if (a.pinned !== b.pinned) return a.pinned ? -1 : 1
    if (a.date !== b.date) return a.date < b.date ? 1 : -1
    return b.createdAt - a.createdAt
  })
}
