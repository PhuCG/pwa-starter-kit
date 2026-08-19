import { describe, expect, it } from 'vitest'
import {
  BACKUP_FORMAT,
  BACKUP_VERSION,
  type BackupPayload,
  backupFileName,
  backupScope,
  parseBackup,
  serializeBackup,
} from './backup'
import type { Note } from './types'

const note = (id: string, date = '2026-08-19'): Note => ({
  id,
  title: `note ${id}`,
  body: '',
  date,
  createdAt: 1_755_000_000_000,
  pinned: false,
})

const payload = (over: Partial<BackupPayload> = {}): BackupPayload => ({
  notes: [note('a')],
  profile: { userName: 'Phu', hasCompletedOnboarding: true },
  locale: 'vi',
  ...over,
})

const fileOf = (data: BackupPayload) =>
  serializeBackup({ exportedAt: '2026-08-19T10:00:00.000Z', data })

describe('round trip', () => {
  it('parses back exactly what was written', () => {
    const result = parseBackup(fileOf(payload()))
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.backup.data.notes).toEqual([note('a')])
    expect(result.backup.data.locale).toBe('vi')
    expect(result.backup.exportedAt).toBe('2026-08-19T10:00:00.000Z')
  })

  it('names the file after the export day', () => {
    expect(backupFileName('2026-08-19T10:00:00.000Z')).toBe(`${BACKUP_FORMAT}-2026-08-19.json`)
  })
})

describe('rejection', () => {
  it('rejects text that is not JSON', () => {
    expect(parseBackup('not json at all')).toMatchObject({ ok: false, reason: 'invalid-json' })
  })

  it('rejects JSON that is not one of our backups', () => {
    expect(parseBackup('{"format":"someone-elses-app","version":1,"data":{}}')).toMatchObject({
      ok: false,
      reason: 'not-a-backup',
    })
  })

  it('rejects a version it cannot read rather than guessing', () => {
    const raw = JSON.stringify({
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION + 1,
      exportedAt: '',
      data: payload(),
    })
    expect(parseBackup(raw)).toMatchObject({ ok: false, reason: 'unsupported-version' })
  })

  it('rejects the whole file when one record is invalid', () => {
    const raw = fileOf(payload({ notes: [note('a'), { ...note('b'), date: '19/08/2026' }] }))
    expect(parseBackup(raw)).toMatchObject({ ok: false, reason: 'corrupt-records' })
  })

  it('rejects duplicate ids, which would silently collapse on restore', () => {
    const raw = fileOf(payload({ notes: [note('a'), note('a')] }))
    expect(parseBackup(raw)).toMatchObject({ ok: false, reason: 'corrupt-records' })
  })

  it('rejects a missing profile', () => {
    const raw = JSON.stringify({
      format: BACKUP_FORMAT,
      version: BACKUP_VERSION,
      exportedAt: '',
      data: { notes: [], locale: 'vi' },
    })
    expect(parseBackup(raw)).toMatchObject({ ok: false, reason: 'not-a-backup' })
  })
})

describe('restored profile', () => {
  it('always lands past onboarding, so a restore does not bounce the user back', () => {
    const raw = fileOf(payload({ profile: { userName: 'Phu', hasCompletedOnboarding: false } }))
    const result = parseBackup(raw)
    expect(result.ok).toBe(true)
    if (!result.ok) return
    expect(result.backup.data.profile.hasCompletedOnboarding).toBe(true)
  })
})

describe('backupScope', () => {
  it('reports the span the records actually cover', () => {
    const scope = backupScope(
      payload({
        notes: [note('a', '2026-03-04'), note('b', '2026-08-19'), note('c', '2026-05-01')],
      }),
    )
    expect(scope).toEqual({ noteCount: 3, firstDate: '2026-03-04', lastDate: '2026-08-19' })
  })

  it('reports empty dates rather than a bogus range for an empty backup', () => {
    expect(backupScope(payload({ notes: [] }))).toEqual({
      noteCount: 0,
      firstDate: '',
      lastDate: '',
    })
  })
})
