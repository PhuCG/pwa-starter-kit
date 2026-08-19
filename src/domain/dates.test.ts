import { describe, expect, it } from 'vitest'
import {
  addDays,
  addMonths,
  dayKey,
  dayRange,
  daysInCalendarMonth,
  monthKey,
  monthKeyOfDay,
  parseDayKey,
  previousMonth,
} from './dates'

describe('dates', () => {
  it('monthKey pads month', () => {
    expect(monthKey({ year: 2026, month: 5 })).toBe('2026-05')
    expect(monthKey({ year: 2026, month: 12 })).toBe('2026-12')
  })

  it('daysInCalendarMonth handles 28/29/30/31', () => {
    expect(daysInCalendarMonth(2026, 2)).toBe(28)
    expect(daysInCalendarMonth(2024, 2)).toBe(29) // leap
    expect(daysInCalendarMonth(2026, 4)).toBe(30)
    expect(daysInCalendarMonth(2026, 8)).toBe(31)
  })

  it('previousMonth rolls over January', () => {
    expect(previousMonth({ year: 2026, month: 1 })).toEqual({ year: 2025, month: 12 })
    expect(previousMonth({ year: 2026, month: 8 })).toEqual({ year: 2026, month: 7 })
  })

  it('addMonths rolls over both directions', () => {
    expect(addMonths({ year: 2026, month: 1 }, -1)).toEqual({ year: 2025, month: 12 })
    expect(addMonths({ year: 2026, month: 11 }, 3)).toEqual({ year: 2027, month: 2 })
    expect(addMonths({ year: 2026, month: 1 }, -13)).toEqual({ year: 2024, month: 12 })
  })

  it('addDays crosses month and year boundaries', () => {
    expect(addDays('2026-01-31', 1)).toBe('2026-02-01')
    expect(addDays('2026-01-01', -1)).toBe('2025-12-31')
    expect(addDays('2024-02-28', 1)).toBe('2024-02-29')
  })

  it('dayRange is inclusive', () => {
    expect(dayRange('2026-02-27', '2026-03-01')).toEqual(['2026-02-27', '2026-02-28', '2026-03-01'])
  })

  it('dayKey / parseDayKey round-trip', () => {
    expect(dayKey(2026, 8, 3)).toBe('2026-08-03')
    expect(parseDayKey('2026-08-03')).toEqual({ year: 2026, month: 8, day: 3 })
    expect(monthKeyOfDay('2026-08-03')).toBe('2026-08')
  })
})
