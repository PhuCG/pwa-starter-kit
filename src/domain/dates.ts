/** Calendar-day helpers over `yyyy-MM-dd` / `yyyy-MM` string keys (timezone-free). */

export interface YearMonth {
  year: number
  month: number // 1..12
}

const pad2 = (n: number) => String(n).padStart(2, '0')

export function monthKey(ym: YearMonth): string {
  return `${ym.year}-${pad2(ym.month)}`
}

export function dayKey(year: number, month: number, day: number): string {
  return `${year}-${pad2(month)}-${pad2(day)}`
}

export function dateToDayKey(d: Date): string {
  return dayKey(d.getFullYear(), d.getMonth() + 1, d.getDate())
}

export function dateToMonthKey(d: Date): string {
  return monthKey({ year: d.getFullYear(), month: d.getMonth() + 1 })
}

export function parseDayKey(key: string): { year: number; month: number; day: number } {
  const [y, m, d] = key.split('-')
  return { year: Number(y), month: Number(m), day: Number(d) }
}

export function monthKeyOfDay(dayK: string): string {
  return dayK.slice(0, 7)
}

/** Days in calendar month (28/29/30/31). month is 1..12. */
export function daysInCalendarMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate()
}

/** Previous calendar month of the given one. */
export function previousMonth(ym: YearMonth): YearMonth {
  return ym.month === 1 ? { year: ym.year - 1, month: 12 } : { year: ym.year, month: ym.month - 1 }
}

/** Add `delta` months (can be negative), matching Dart's DateTime(y, m + delta) rollover. */
export function addMonths(ym: YearMonth, delta: number): YearMonth {
  const zeroBased = ym.year * 12 + (ym.month - 1) + delta
  const year = Math.floor(zeroBased / 12)
  return { year, month: (zeroBased % 12) + 12 * (zeroBased % 12 < 0 ? 1 : 0) + 1 }
}

/** Day key shifted by `delta` days. */
export function addDays(dayK: string, delta: number): string {
  const { year, month, day } = parseDayKey(dayK)
  const d = new Date(year, month - 1, day + delta)
  return dateToDayKey(d)
}

/**
 * Inclusive list of day keys from `start` to `end`.
 * Day/month keys are zero-padded, so plain `<`, `>`, `===` compare them
 * correctly — no dedicated comparison helpers needed.
 */
export function dayRange(start: string, end: string): string[] {
  const out: string[] = []
  for (let d = start; d <= end; d = addDays(d, 1)) out.push(d)
  return out
}
