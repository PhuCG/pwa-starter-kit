import { db } from '@/db/db'
import { flushWrites, loadAll } from '@/db/repo'
import { serializeBackup } from '@/domain/backup'
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

describe('backup', () => {
  it('round-trips the whole app state through a file', async () => {
    const store = useAppStore.getState()
    store.completeOnboarding('Phu')
    store.addNote({ title: 'keep me', body: 'body', date: '2026-08-19' })
    const json = serializeBackup({
      exportedAt: '2026-08-19T10:00:00.000Z',
      data: useAppStore.getState().backupPayload(),
    })

    // Wipe everything the way a cleared browser would.
    useAppStore.getState().removeNote(useAppStore.getState().notes[0]?.id ?? '')
    await flushWrites()
    expect(useAppStore.getState().notes).toEqual([])

    const result = await useAppStore.getState().restoreBackup(json)

    expect(result.ok).toBe(true)
    expect(useAppStore.getState().notes.map((n) => n.title)).toEqual(['keep me'])
    expect(useAppStore.getState().profile.userName).toBe('Phu')
    expect((await loadAll()).notes.map((n) => n.title)).toEqual(['keep me'])
  })

  it('leaves existing data untouched when the file is rejected', async () => {
    useAppStore.getState().addNote({ title: 'mine', body: '' })
    await flushWrites()

    const result = await useAppStore.getState().restoreBackup('{"format":"nope"}')

    expect(result).toMatchObject({ ok: false, reason: 'not-a-backup' })
    expect(useAppStore.getState().notes.map((n) => n.title)).toEqual(['mine'])
    expect((await loadAll()).notes).toHaveLength(1)
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
