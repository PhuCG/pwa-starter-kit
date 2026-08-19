import { APP } from '@/app.config'
import { DomainConstraintError, assertNote, isNonBlank } from './constraints'
import type { Note, Profile } from './types'

/**
 * The backup file format: pure serialization and validation.
 *
 * With no backend (ADR 001) this file is the **only** copy of the data that can
 * survive a cleared browser, a lost device, or an eviction `persist()` could
 * not prevent. That makes two things non-negotiable:
 *
 * 1. **Everything the app owns goes in**, including the localStorage scalars. A
 *    restore that brought back the records but lost the profile and the
 *    language would not be a restore.
 * 2. **A file is validated completely before any of it is applied.** A restore
 *    overwrites the user's data, so a half-valid file has to be rejected while
 *    it can still be rejected — every record goes through the same domain
 *    asserts the store uses at its own write boundary.
 *
 * Blob, share-sheet and file-picker plumbing lives in `src/db/backupIo.ts` so
 * this module stays testable in plain node.
 */

/** Identifies the file as ours. Renamed with the project by `npm run init`. */
export const BACKUP_FORMAT = `${APP.dbName}-backup`
export const BACKUP_VERSION = 1

export interface BackupPayload {
  notes: Note[]
  profile: Profile
  locale: string
}

export interface BackupFile {
  format: string
  version: number
  /** ISO datetime the backup was taken. Informational. */
  exportedAt: string
  data: BackupPayload
}

export type BackupError =
  | 'invalid-json'
  | 'not-a-backup'
  | 'unsupported-version'
  | 'corrupt-records'

export type ParseResult =
  | { ok: true; backup: BackupFile }
  | { ok: false; reason: BackupError; detail?: string }

export function serializeBackup(args: { exportedAt: string; data: BackupPayload }): string {
  const file: BackupFile = {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    exportedAt: args.exportedAt,
    data: args.data,
  }
  // Indented: a backup a user can open and read is a backup they trust.
  return JSON.stringify(file, null, 2)
}

export function backupFileName(exportedAt: string): string {
  return `${BACKUP_FORMAT}-${exportedAt.slice(0, 10)}.json`
}

/**
 * How much a backup actually holds.
 *
 * Without this the export toast can only say "saved" and the restore dialog can
 * only say "everything will be replaced" — neither with a number in it. The file
 * name carries the export date, so a user whose records all sit inside one month
 * has every reason to read a complete backup as a one-day one, and no way to
 * tell the difference without opening the JSON by hand.
 */
export interface BackupScope {
  noteCount: number
  /** Earliest record day, `yyyy-MM-dd`. `''` when there are none. */
  firstDate: string
  /** Latest record day, `yyyy-MM-dd`. `''` when there are none. */
  lastDate: string
}

export function backupScope(data: BackupPayload): BackupScope {
  let firstDate = ''
  let lastDate = ''
  for (const note of data.notes) {
    // Zero-padded day keys sort as plain strings — see `domain/dates`.
    if (firstDate === '' || note.date < firstDate) firstDate = note.date
    if (lastDate === '' || note.date > lastDate) lastDate = note.date
  }
  return { noteCount: data.notes.length, firstDate, lastDate }
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v)
}

/** Parse and fully validate an uploaded file. Never throws. */
export function parseBackup(raw: string): ParseResult {
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    return { ok: false, reason: 'invalid-json' }
  }

  if (!isRecord(parsed) || parsed.format !== BACKUP_FORMAT) {
    return { ok: false, reason: 'not-a-backup' }
  }
  if (typeof parsed.version !== 'number' || !Number.isInteger(parsed.version)) {
    return { ok: false, reason: 'not-a-backup' }
  }
  // A newer version we cannot understand; an older one would need a reader
  // written for it. Both are a clear "no", not a best-effort import.
  if (parsed.version !== BACKUP_VERSION) {
    return { ok: false, reason: 'unsupported-version', detail: String(parsed.version) }
  }

  const data = parsed.data
  if (!isRecord(data)) return { ok: false, reason: 'not-a-backup' }
  if (!Array.isArray(data.notes) || !isRecord(data.profile)) {
    return { ok: false, reason: 'not-a-backup' }
  }

  const notes = data.notes as Note[]
  const profile = data.profile as unknown as Profile
  const seen = new Set<string>()

  try {
    for (const note of notes) {
      assertNote(note)
      if (!isNonBlank(note.id)) throw new DomainConstraintError('note is missing an id')
      // Duplicate ids would silently collapse on bulkPut, so the restore would
      // land fewer records than the file claims — with no error anywhere.
      if (seen.has(note.id)) throw new DomainConstraintError(`duplicate note id ${note.id}`)
      seen.add(note.id)
    }
    if (typeof profile.userName !== 'string') {
      throw new DomainConstraintError('profile.userName must be a string')
    }
  } catch (err) {
    if (err instanceof DomainConstraintError) {
      return { ok: false, reason: 'corrupt-records', detail: err.message }
    }
    return { ok: false, reason: 'corrupt-records' }
  }

  return {
    ok: true,
    backup: {
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      exportedAt: typeof parsed.exportedAt === 'string' ? parsed.exportedAt : '',
      data: {
        notes,
        profile: {
          userName: profile.userName,
          // Restoring onboarding as incomplete would bounce the user straight
          // back into it with their data already loaded.
          hasCompletedOnboarding: true,
        },
        locale: typeof data.locale === 'string' ? data.locale : '',
      },
    },
  }
}
