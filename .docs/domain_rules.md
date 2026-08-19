# Business rules

This file is the **source of truth for `src/domain/`**. Every rule here has a function
and a test. Changing a rule means changing this file **in the same commit** as the code
and the test.

A rule that lives only in your head, or only inside a component, is not a rule — it is a
bug waiting to happen.

---

## 1. Shared invariants (`src/domain/constraints.ts`)

This is the definition of "valid data". The store asserts at the write boundary; the UI
validates the same rules **before** submitting, with friendly messages. That is what
makes a `DomainConstraintError` at runtime **always a programming bug** and never a user
typo.

| Constraint | Meaning |
|---|---|
| `isPositiveNumber` / `isNonNegativeNumber` | `NaN` and `Infinity` are **not** valid numbers |
| `isDayKey` | Exactly `yyyy-MM-dd`, zero-padded, month 1–12, day 1–31 |
| `isMonthKey` | Exactly `yyyy-MM` |
| `isNonBlank` | A whitespace-only string counts as empty |

## 2. Dates (`src/domain/dates.ts`)

- Every stored date is a **string key**, `yyyy-MM-dd` or `yyyy-MM`, never a `Date`. A
  `Date` carries a timezone, and a record created at 23:30 lands on a different day once
  the user travels.
- Keys are zero-padded, so `<`, `>` and `===` compare them correctly — no dedicated
  comparison helpers needed.
- Display always goes through `Intl.DateTimeFormat(i18n.language, ...)`. No hardcoded
  month names.

## 3. Backup (`src/domain/backup.ts`)

- A backup carries **everything the app owns**, including the localStorage scalars. A
  restore that brought back the records but lost the profile and the language would not
  be a restore.
- A file is **validated completely before any of it is applied**. Every record goes
  through the same asserts the store uses, plus a duplicate-id check — duplicates would
  silently collapse on `bulkPut` and land fewer records than the file claims.
- `hasCompletedOnboarding` is forced to `true` on restore. Restoring it as `false` would
  bounce the user back into onboarding with their data already loaded.
- Each failure mode has its own message. A single "invalid file" does not tell the user
  whether to look for a different file or give up on this one.

## 4. <Your business rule>

For each rule, record three things:

**The formula or rule.** In words or notation. Do not paste code.

**The edge cases.** Division by zero, empty collections, months of 28/29/30/31 days,
negative values, numbers too large. An edge case without a test is an undecided one.

**Why this rule and not another.** This is the part the code cannot say.

A skeleton:

> ### 4.1 <Rule name>
>
> `<output> = <expression>`
>
> - When `<denominator>` is 0 → return `<value>`, not `NaN`.
> - Rounding: only at the **display boundary**, never mid-calculation.
> - Chosen because ... . Option `<B>` was rejected because ... .
>
> Code: `src/domain/<module>.ts` · Test: `src/domain/<module>.test.ts`
