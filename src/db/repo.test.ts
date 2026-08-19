import type { Note } from '@/domain/types'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { db } from './db'
import { deleteNote, flushWrites, loadAll, onWriteFailure, putNote, replaceAll } from './repo'

const note = (id: string, over: Partial<Note> = {}): Note => ({
  id,
  title: id,
  body: '',
  date: '2026-08-19',
  createdAt: 1_755_000_000_000,
  pinned: false,
  ...over,
})

afterEach(async () => {
  onWriteFailure(null)
  await db.notes.clear()
})

describe('repo', () => {
  it('persists and reloads a record', async () => {
    putNote(note('a'))
    await flushWrites()
    expect((await loadAll()).notes).toEqual([note('a')])
  })

  it('deletes without disturbing its neighbours', async () => {
    putNote(note('a'))
    putNote(note('b'))
    await flushWrites()
    deleteNote('a')
    await flushWrites()
    expect((await loadAll()).notes.map((n) => n.id)).toEqual(['b'])
  })

  it('reports a failed write instead of swallowing it', async () => {
    const failures: string[] = []
    onWriteFailure((f) => failures.push(f.op))
    vi.spyOn(db.notes, 'put').mockRejectedValueOnce(new Error('QuotaExceededError'))

    putNote(note('a'))
    await flushWrites()

    expect(failures).toEqual(['notes.put'])
  })

  it('replaceAll swaps the whole table atomically', async () => {
    putNote(note('old'))
    await flushWrites()
    await replaceAll({ notes: [note('new')] })
    expect((await loadAll()).notes.map((n) => n.id)).toEqual(['new'])
  })
})
