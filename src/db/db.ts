import { APP } from '@/app.config'
import type { Note } from '@/domain/types'
import Dexie, { type Table } from 'dexie'

/**
 * The Dexie schema. One database, one table per entity.
 *
 * **Index policy: carry only the indexes a query actually uses.** Every extra
 * index is paid on each insert and update, and it is very easy to declare a
 * compound index "for later" that no query ever touches. Adding one later is
 * cheap — an index-only change just needs the version bumped, with no upgrade
 * callback, because Dexie rebuilds indexes on open without touching rows.
 *
 * A version bump DOES need an upgrade callback when the shape of stored rows
 * changes. Write it next to the `.version()` call, never in application code.
 */
export class AppDB extends Dexie {
  notes!: Table<Note, string>

  constructor() {
    super(APP.dbName)
    this.version(1).stores({
      // `date` is indexed because the list query sorts by it; `pinned` is not,
      // because that partition happens in memory over an already-loaded array.
      notes: 'id, date',
    })
  }
}

export const db = new AppDB()
