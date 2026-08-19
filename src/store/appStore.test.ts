import { db } from '@/db/db'
import { flushWrites, loadAll } from '@/db/repo'
import { DomainConstraintError } from '@/domain/constraints'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { useAppStore } from './appStore'

const reset = () =>
  useAppStore.setState({
    hydrateStatus: 'idle',
    hydrateError: null,
    lastWriteError: null,
    profile: { userName: '', hasCompletedOnboarding: false },
    notes: [],
  })

beforeEach(reset)
afterEach(async () => {
  await flushWrites()
  await db.notes.clear()
})

describe('hydrate', () => {
  it('reaches ready and loads what is on disk', async () => {
    useAppStore.getState().addNote({ title: 'persisted', body: '' })
    await flushWrites()
    reset()

    await useAppStore.getState().hydrate()

    expect(useAppStore.getState().hydrateStatus).toBe('ready')
    expect(useAppStore.getState().notes.map((n) => n.title)).toEqual(['persisted'])
  })
})

describe('notes', () => {
  it('writes through to disk', async () => {
    useAppStore.getState().addNote({ title: 'a', body: 'body' })
    await flushWrites()
    expect((await loadAll()).notes.map((n) => n.title)).toEqual(['a'])
  })

  it('rejects an invalid record at the write boundary', () => {
    expect(() => useAppStore.getState().addNote({ title: '  ', body: '' })).toThrow(
      DomainConstraintError,
    )
    expect(useAppStore.getState().notes).toEqual([])
  })

  it('keeps pinned notes first', () => {
    const store = useAppStore.getState()
    store.addNote({ title: 'first', body: '', date: '2026-08-19' })
    store.addNote({ title: 'second', body: '', date: '2026-08-18' })
    const older = useAppStore.getState().notes.find((n) => n.title === 'second')
    // biome-ignore lint/style/noNonNullAssertion: just created above
    useAppStore.getState().togglePin(older!.id)

    expect(useAppStore.getState().notes.map((n) => n.title)).toEqual(['second', 'first'])
  })

  it('removes a note from memory and disk', async () => {
    useAppStore.getState().addNote({ title: 'doomed', body: '' })
    const [note] = useAppStore.getState().notes
    // biome-ignore lint/style/noNonNullAssertion: just created above
    useAppStore.getState().removeNote(note!.id)
    await flushWrites()

    expect(useAppStore.getState().notes).toEqual([])
    expect((await loadAll()).notes).toEqual([])
  })
})

describe('profile', () => {
  it('completing onboarding flips the guard flag', () => {
    useAppStore.getState().completeOnboarding('  Phu  ')
    expect(useAppStore.getState().profile).toEqual({
      userName: 'Phu',
      hasCompletedOnboarding: true,
    })
  })
})
