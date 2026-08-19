import { describe, expect, it } from 'vitest'
import {
  DomainConstraintError,
  assertNote,
  isDayKey,
  isMonthKey,
  isNonNegativeNumber,
  isPositiveNumber,
} from './constraints'
import type { Note } from './types'

const note = (over: Partial<Note> = {}): Note => ({
  id: 'note_1',
  title: 'Title',
  body: '',
  date: '2026-08-19',
  createdAt: 1_755_000_000_000,
  pinned: false,
  ...over,
})

describe('key predicates', () => {
  it('accepts well-formed keys', () => {
    expect(isDayKey('2026-08-19')).toBe(true)
    expect(isMonthKey('2026-08')).toBe(true)
  })

  it('rejects unpadded, out-of-range and wrong-shaped keys', () => {
    expect(isDayKey('2026-8-19')).toBe(false)
    expect(isDayKey('2026-13-01')).toBe(false)
    expect(isDayKey('2026-08')).toBe(false)
    expect(isMonthKey('2026-08-19')).toBe(false)
  })
})

describe('number predicates', () => {
  it('treats NaN and Infinity as invalid, not as numbers', () => {
    expect(isPositiveNumber(Number.NaN)).toBe(false)
    expect(isPositiveNumber(Number.POSITIVE_INFINITY)).toBe(false)
    expect(isNonNegativeNumber(0)).toBe(true)
    expect(isPositiveNumber(0)).toBe(false)
  })
})

describe('assertNote', () => {
  it('passes a valid note', () => {
    expect(() => assertNote(note())).not.toThrow()
  })

  it('rejects a whitespace-only title', () => {
    expect(() => assertNote(note({ title: '   ' }))).toThrow(DomainConstraintError)
  })

  it('rejects a date that is not a padded day key', () => {
    expect(() => assertNote(note({ date: '19/08/2026' }))).toThrow(DomainConstraintError)
  })
})
