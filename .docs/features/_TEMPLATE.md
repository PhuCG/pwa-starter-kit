# <Feature name>

> Status: ✅ Done | 🚧 Partial | ❌ Not built
> Last updated: YYYY-MM-DD — branch: `<branch>`

## Purpose

One short paragraph: what problem this solves for the user. Not what the code does.

## Screens and routes

| Route | File | Notes |
|---|---|---|
| `/example` | `src/features/example/ExamplePage.tsx` | |

Required UI states: **loading · empty · content · error**. Say what each one shows.

## Behaviour

- The user does X → the system does Y.
- Edge conditions, error messages, confirmation before anything destructive.
- Sort order, grouping rules, what appears first.

## Domain and data

| Concern | Where |
|---|---|
| Rules / classification | `src/domain/<module>.ts` (+ `.test.ts`) |
| Invariants | `src/domain/constraints.ts` |
| Read/write | `useAppStore` actions: `...` · Dexie: `src/db/repo.ts` |

Every calculation or classification lives in `src/domain/` with a test — never in a
component (rule 2 in `../../CLAUDE.md`).

## i18n

Key prefix: `example*`. Add each key to **every** file in `i18n/`, not just one.
`src/lib/i18n.integrity.test.ts` fails on drift.

## Decisions

Record the choices and trade-offs that reading the code cannot reveal:

- **<Decision>** — chose A over B because ... . Consequence: ... .
- **Deliberately not done** — ... , because ... .

If a decision reaches beyond this feature, write an ADR in
[`../decisions/`](../decisions/) and link it here.

## Known gaps

- [ ] ...

## References

- Flow spec: [../app_flow/](../app_flow/)
- Business rules: [../domain_rules.md](../domain_rules.md)
