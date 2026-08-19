import type { Note } from '@/domain/types'
import { db } from './db'

/**
 * The only module that touches Dexie. All writes are per-record — never
 * clear-and-rewrite.
 *
 * Writes are **fire-and-forget by design**: the store updates React state
 * synchronously and does not block the UI on disk. What they must not be is
 * *silent*. A rejected write (quota exhausted, blocked upgrade, evicted store)
 * would otherwise disappear into an unhandled promise while the UI kept showing
 * the record as saved, so the loss only surfaced on the next reload.
 *
 * Every write therefore goes through `track`, which reports failures to a
 * single subscriber (the store, which turns it into a toast) and keeps the
 * pending set observable so tests can await it instead of racing.
 */

export interface WriteFailure {
  /** Which write failed, e.g. `notes.put`. Diagnostic, not user copy. */
  op: string
  message: string
}

type FailureHandler = (failure: WriteFailure) => void

const pending = new Set<Promise<void>>()
let handler: FailureHandler | null = null

/** Register the single failure sink. Later calls replace the previous one. */
export function onWriteFailure(fn: FailureHandler | null): void {
  handler = fn
}

function track(op: string, work: Promise<unknown>): void {
  const settled = work
    .then(() => undefined)
    .catch((err: unknown) => {
      handler?.({ op, message: err instanceof Error ? err.message : String(err) })
    })
    .finally(() => {
      pending.delete(settled)
    })
  pending.add(settled)
}

/**
 * Resolve once every in-flight write has settled. Test-only in practice: the
 * app never waits, but an assertion about persistence has to.
 */
export async function flushWrites(): Promise<void> {
  // A write can be queued by a failure handler, so drain until the set empties.
  while (pending.size > 0) await Promise.all([...pending])
}

export async function loadAll(): Promise<{ notes: Note[] }> {
  const [notes] = await Promise.all([db.notes.toArray()])
  return { notes }
}

/**
 * Wipe and repopulate every table in one Dexie transaction — the restore path.
 * Unlike the tracked writes above this is awaited and allowed to throw: a
 * half-applied restore leaves the user with a state they cannot reason about,
 * so the caller has to know whether it landed.
 */
export async function replaceAll(data: { notes: Note[] }): Promise<void> {
  await db.transaction('rw', db.notes, async () => {
    await db.notes.clear()
    await db.notes.bulkPut(data.notes)
  })
}

export const putNote = (n: Note) => track('notes.put', db.notes.put(n))
export const putNotes = (ns: Note[]) => track('notes.bulkPut', db.notes.bulkPut(ns))
export const deleteNote = (id: string) => track('notes.delete', db.notes.delete(id))
