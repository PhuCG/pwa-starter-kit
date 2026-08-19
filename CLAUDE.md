# <PROJECT NAME> — Claude Instructions

React 18 + Vite + TypeScript PWA, local-first (no backend).

> **Cloned from the starter?** Everything in angle brackets is a placeholder.
> Run `npm run init` first (it rewrites identity), then fix by hand: the one-line
> summary above, the **Domain modules** table, and rule 8. Delete this quote block
> when you are done — its presence means the file is still generic.

## Non-negotiable rules

1. **No emoji / stickers / decorative Unicode in the UI.** Not in i18n strings, JSX
   text, toasts, or placeholders — it reads unprofessional and AI-generated. Icons
   come ONLY from the registry via `<AppIcon name="..."/>`
   (`src/components/ui/icons.tsx`). No text glyphs (✕ ✓ ★ →) used as icons either.
   `src/lib/i18n.integrity.test.ts` fails the build on an emoji in the catalog —
   keep that safety net. Friendly tone comes from wording, not pictographs.
2. **Business rules live ONLY in `src/domain/`** (pure TypeScript, no React imports).
   Every rule change ships with a vitest update; `npm run test` must stay green.
   **Invariants are centralized in `src/domain/constraints.ts`.** Store actions assert
   them at the write boundary; the UI validates the same rules with friendly messages
   BEFORE submitting — so a `DomainConstraintError` always means a programming bug,
   never user input.
   *No calculation or classification may live in a component.* If a page derives a
   number or a status, that logic belongs in a domain module with a test.
3. **Colors / spacing / radius / shadows / typography only via tokens** in
   `src/styles/tokens.css` (`var(--color-*)`, `var(--sp-*)`, `var(--radius-*)`,
   `.text-*` classes). No raw hex, no raw px.
4. **All user-facing strings via i18n keys** (`useTranslation`). Add the key to every
   file in `i18n/`, never to just one. `src/lib/i18n.integrity.test.ts` fails on
   missing keys, dead copy, locale drift, and emoji.
5. **Data access through `useAppStore` actions + selectors** (`src/store/`); Dexie only
   via `src/db/repo.ts`. A component never imports `db` directly.
6. **Cards: border OR shadow, never both.** Progress bars: `<ProgressBar>` only —
   6px pill by default, `size="sm"` (4px) when the bar merely supports a figure that
   is already spelled out beside it. No third size.
7. **Dates render via `Intl.DateTimeFormat(i18n.language, ...)`** — no hardcoded month
   or day names. Stored dates are `yyyy-MM-dd` / `yyyy-MM` string keys, never `Date`.
8. **<Project-specific deliberate constraint.>** State the thing this project
   deliberately does NOT do, and which extension points are kept on purpose so nobody
   "fixes" it later. Delete this rule if there is nothing to say.
9. **Every change to feature behaviour ships with its doc, in the same commit.** Not a
   follow-up commit, not "later". See [Workflow](#workflow) for which file.
10. **Feature work happens on its own branch, in small labelled commits.** Never commit
    feature work straight to `main`.

## Workflow

### Branching

One branch per feature or fix, cut from an up-to-date `main`:

| Prefix | Use for |
|---|---|
| `feat/<slug>` | new user-facing capability |
| `fix/<slug>` | bug fix |
| `refactor/<slug>` | behaviour unchanged, structure changed |
| `perf/<slug>` | measured performance work |
| `docs/<slug>` | docs only |
| `chore/<slug>` | tooling, deps, config |

Merge back only when `npm run check` is clean.

### Commits

Split the work so each commit is one reviewable idea, in this order where it applies:

1. domain module + its test (the rule itself),
2. store action / repo wiring,
3. UI,
4. i18n,
5. docs.

Steps 1–4 may collapse into one commit for a small change; **step 5 never gets
dropped** — fold the doc update into the commit it describes if you are not making it
separate.

Message: imperative subject line under ~72 chars saying what changed, then a body
explaining *why* and the trade-off taken. No ticket-speak, no "update files".

### Docs — required on every update

Before a branch is merged, the matching docs must already be true:

| What you changed | Update |
|---|---|
| Any feature behaviour | `.docs/features/<feature>.md` (create from `.docs/features/_TEMPLATE.md` if missing) **and** the row in `.docs/features/README.md` |
| A domain rule or invariant | `.docs/domain_rules.md` — same commit as `src/domain/` + its test |
| A route, screen or UI state | the matching file in `.docs/app_flow/` |
| A design token | `.docs/theme/design-system.md` |
| A project-wide constraint or a deliberate omission | a numbered rule in this file, and the **Decisions** section of the feature doc |
| A choice with a real alternative you rejected | `.docs/decisions/NNN-<slug>.md` |

If a feature has no doc yet, the change that touches it is when the doc gets written —
that is the backfill mechanism, and `.docs/features/README.md` tracks what is missing.
Docs record **behaviour and reasoning**, not a restatement of the code.

## Commands

- `npm run dev` / `build` / `preview`
- `npm run test` — vitest (domain + store + db)
- `npm run check` — lint + typecheck + test; what CI runs
- `npx biome check src --write` — lint + format

## Architecture

Data flows one way, and each layer may only import downward:

```
features/  (screens — no calculations, no direct Dexie)
   ↓
store/     (zustand: actions assert invariants, then write memory + disk)
   ↓
db/        (repo.ts is the only Dexie caller; localScalars.ts the only localStorage caller)
   ↓
domain/    (pure TS: types, invariants, rules — imports nothing above it)
```

`components/ui/` is the shared kit, `lib/` is app-agnostic glue, `pwa/` is the
installability and viewport layer.

### Domain modules (`src/domain/` — every one has a `.test.ts`)

| Module | Owns |
|---|---|
| `constraints` | All invariants + assert helpers (rule 2) |
| `types` | The persisted shapes |
| `dates` | `yyyy-MM-dd` / `yyyy-MM` key math (padded keys compare with `<`/`>`) |
| `<yours>` | <what it owns> |

## Key facts

- **Local-first, no backend.** An evicted IndexedDB is permanent data loss. Three
  defences: `navigator.storage.persist()` at startup (Chromium/Firefox only — iOS
  Safari grants the exemption on Home Screen install instead), a JSON backup export,
  and write failures surfaced as a toast rather than swallowed.
- **Writes are fire-and-forget and are NOT rolled back on failure.** The record stays
  in memory and the user is told. Tests await `flushWrites()` from `repo.ts` instead
  of racing.
- **Never call a per-item helper inside a loop** over the whole collection. Build an
  index once and look up.
- **Dexie carries only the indexes a query uses.** Adding one means adding the query
  that needs it plus a version bump — index-only changes need no upgrade function.
- **The viewport is locked** (fixed body, `#root` is the only scroll container, zoom
  refused). iOS keyboard insets are measured in `src/pwa/viewportInsets.ts`, not
  assumed. Do not reintroduce document scrolling.
- **The service worker updates itself** and explains the reload — see
  `src/pwa/ServiceWorkerUpdater.tsx`.
- Deploy: Vercel — `vercel.json` has the SPA rewrite and the SW no-cache headers.
