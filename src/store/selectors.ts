import { monthKeyOfDay } from '@/domain/dates'
import type { Note } from '@/domain/types'
import { useMemo } from 'react'
import { useAppStore } from './appStore'

/**
 * Read side of the store.
 *
 * Components subscribe to *slices*, never to the whole store: `useAppStore()`
 * with no selector re-renders every subscriber on every write, which is the
 * single easiest way to make a local-first app feel slow. Anything derived is
 * memoised here so a page cannot accidentally recompute it per render.
 *
 * Derived VALUES live here. Derived RULES (a classification, a formula, a
 * threshold) live in `src/domain/` with a test — see rule 2 in CLAUDE.md.
 */

export function useNotes(): Note[] {
  return useAppStore((s) => s.notes)
}

export function useNote(id: string | undefined): Note | undefined {
  const notes = useNotes()
  return useMemo(() => (id ? notes.find((n) => n.id === id) : undefined), [notes, id])
}

/** Notes grouped by day key, in the store's canonical order. */
export function useNotesByDay(): Map<string, Note[]> {
  const notes = useNotes()
  return useMemo(() => {
    const out = new Map<string, Note[]>()
    for (const note of notes) {
      const bucket = out.get(note.date)
      if (bucket) bucket.push(note)
      else out.set(note.date, [note])
    }
    return out
  }, [notes])
}

export function useNotesInMonth(month: string): Note[] {
  const notes = useNotes()
  return useMemo(() => notes.filter((n) => monthKeyOfDay(n.date) === month), [notes, month])
}
