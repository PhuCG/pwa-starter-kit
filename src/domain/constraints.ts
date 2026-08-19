import type { Note } from './types'

/**
 * Domain invariants — the single place that states what "valid data" means.
 *
 * The contract, and the reason this file exists at all:
 *
 * - **Store actions assert at the write boundary.** Nothing reaches Dexie
 *   without passing through here.
 * - **UI validates the same rules before submitting**, with friendly messages.
 * - Therefore a `DomainConstraintError` at runtime is *always* a programming
 *   bug, never a user mistake — which is what makes it safe to let it throw.
 *
 * Keep the assertions dumb and total. Anything that needs context (does this
 * category still exist? is the user over their limit?) is a rule, not an
 * invariant, and belongs in its own domain module with its own test.
 */

export class DomainConstraintError extends Error {
  constructor(message: string) {
    super(`Domain constraint violated: ${message}`)
    this.name = 'DomainConstraintError'
  }
}

const DAY_KEY_RE = /^\d{4}-\d{2}-\d{2}$/
const MONTH_KEY_RE = /^\d{4}-\d{2}$/

export function isPositiveNumber(v: number): boolean {
  return Number.isFinite(v) && v > 0
}

export function isNonNegativeNumber(v: number): boolean {
  return Number.isFinite(v) && v >= 0
}

export function isDayKey(s: string): boolean {
  if (!DAY_KEY_RE.test(s)) return false
  const month = Number(s.slice(5, 7))
  const day = Number(s.slice(8, 10))
  return month >= 1 && month <= 12 && day >= 1 && day <= 31
}

export function isMonthKey(s: string): boolean {
  if (!MONTH_KEY_RE.test(s)) return false
  const month = Number(s.slice(5, 7))
  return month >= 1 && month <= 12
}

export function isNonBlank(s: string): boolean {
  return s.trim() !== ''
}

export function assertNote(note: Note): void {
  if (!isNonBlank(note.title)) {
    throw new DomainConstraintError('note requires a title')
  }
  if (!isDayKey(note.date)) {
    throw new DomainConstraintError(`note date must be yyyy-MM-dd, got "${note.date}"`)
  }
  if (!isPositiveNumber(note.createdAt)) {
    throw new DomainConstraintError(
      `note createdAt must be a positive epoch, got ${note.createdAt}`,
    )
  }
}
