/**
 * Every shape the app persists or reasons about.
 *
 * `Note` is the worked example: delete it and put your own entities here. What
 * matters is the shape of the contract, not the entity —
 *
 * - ids are strings built by `src/lib/id.ts`, never array indexes,
 * - dates are `yyyy-MM-dd` / `yyyy-MM` *string keys*, never `Date` objects, so
 *   nothing that gets stored can drift with a timezone,
 * - no field is optional unless "absent" genuinely means something different
 *   from a default value.
 */

/** Calendar day, `yyyy-MM-dd`. */
export type DayKey = string
/** Calendar month, `yyyy-MM`. */
export type MonthKey = string

export interface Note {
  id: string
  title: string
  body: string
  /** Day the note belongs to — what the UI groups and sorts by. */
  date: DayKey
  /** Epoch millis, for tie-breaking two notes on the same day. */
  createdAt: number
  pinned: boolean
}

export interface Profile {
  userName: string
  hasCompletedOnboarding: boolean
}

export const EMPTY_PROFILE: Profile = {
  userName: '',
  hasCompletedOnboarding: false,
}
