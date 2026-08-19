# PWA Starter

A starting point for **local-first PWA** projects: React 18 + Vite + TypeScript, with
all data on the user's device (IndexedDB via Dexie) and no backend.

Extracted from [chill_money_web](../chill_money/chill_money_web) — the infrastructure,
the rules and the docs system kept, the finance domain removed.

## Getting started

```bash
git clone <repo-url> my-app && cd my-app
npm install
npm run init          # name, slug, colour, locale — rewrites all five identity files
npm run dev
```

`npm run init` also runs non-interactively:

```bash
node scripts/init-project.mjs --name "Habit Log" --slug habit-log --short Habits --color "#0ea5e9" --locale en --yes --fresh-git
```

Then work through the checklist it prints: replace the icons in `public/`, finish the
palette in `src/styles/tokens.css`, swap the `Note` example for your own entity, and
fill in the `<placeholder>` sections in `CLAUDE.md` and `.docs/`.

## What you get

| Layer | Contents |
|---|---|
| **Build** | Vite 6, strict TypeScript (`noUncheckedIndexedAccess`), Biome (lint + format), Vitest + jsdom + fake-indexeddb, `npm run check` runs all three |
| **PWA** | vite-plugin-pwa, a service worker that updates itself and explains the reload, install card (Android/iOS), viewport lock, measured iOS keyboard insets, a manifest with `id` / screenshots / shortcuts / `launch_handler` |
| **Data** | Dexie (`src/db/db.ts`), a repo that is the only Dexie caller, write failures surfaced rather than swallowed, `navigator.storage.persist()`, JSON backup/restore with full-file validation |
| **State** | zustand, hydration as a state machine (`idle/loading/ready/error`) with retry, memoised selectors |
| **Domain** | Pure TypeScript, `constraints.ts` centralising every invariant, `dates.ts` for `yyyy-MM-dd` key math |
| **UI kit** | Card, Button, Sheet (vaul), Dialog, EmptyState, ProgressBar, DateField, MonthNavigator, SegmentedToggle, Toast, Skeleton, HalfDonutGauge — all driven by design tokens |
| **Appearance** | Dark theme (system / light / dark) via `data-theme`, inline no-flash script, `theme-color` kept in step |
| **Resilience** | `ErrorBoundary` per route (navigating away recovers) plus one around the router |
| **i18n** | i18next + ICU, two sample locales, a test that catches missing keys, dead copy, locale drift and emoji |
| **Docs** | `.docs/` with templates for features, app flows, ADRs and the design system |
| **Process** | `CLAUDE.md` (rules + workflow), `.claude/launch.json`, `.vscode/` (Biome as formatter, recommended extensions), GitHub Actions CI |
| **Deploy** | `vercel.json` — SPA rewrite plus cache headers for the service worker, assets and fonts |

## Commands

```bash
npm run dev        # vite dev server on port 5173
npm run check      # lint + typecheck + test — exactly what CI runs
npm run build      # tsc -b && vite build
npm run preview    # serve the production build on port 4173
```

## Layout

```
src/
├── app.config.ts        app identity — the only place the name, colours and storage prefix live
├── main.tsx             startup order: viewport lock → i18n → render
├── App.tsx              the three startup states (splash / error with retry / ready)
├── routes.tsx           lazy routes behind the onboarding guard
├── components/          shared UI kit and the error boundary
├── db/                  Dexie schema, repo, localStorage scalars, persistence, backup I/O
├── domain/              pure TypeScript: types, invariants, business rules (all tested)
├── features/            screens — no calculations, no direct Dexie access
├── lib/                 i18n, theme, id generation
├── pwa/                 service worker, install prompt, viewport lock, keyboard insets
├── store/               zustand store and selectors
└── styles/              tokens.css (design tokens) + global.css (reset + viewport lock)
```

The rules and the reasoning behind each decision: [CLAUDE.md](CLAUDE.md) and
[.docs/](.docs/README.md).

## The example to delete

The `Note` entity exists only to demonstrate the contract — validate in the UI, assert
in the store, write through the repo. Once you have your own entity, remove it from
`src/domain/types.ts`, `src/domain/constraints.ts`, `src/domain/backup.ts`,
`src/db/db.ts`, `src/db/repo.ts`, the notes slice of `src/store/appStore.ts`,
`src/store/selectors.ts`, `src/features/home/`, and the `note*` keys in `i18n/`.
