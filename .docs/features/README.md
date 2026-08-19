# Feature status

This table is a **living checklist**. Any PR that touches a feature updates its row here
in the same commit.

- **Code**: ✅ done · 🚧 partial · ❌ not built
- **Doc**: link to the detail doc, or "—" if unwritten. The next change to that feature
  is when the doc gets written, from [`_TEMPLATE.md`](./_TEMPLATE.md), before merge.

A "✅ / —" row is **debt**, not a steady state.

---

## Shell and navigation

| Feature | Route | Code | Doc |
|---|---|---|---|
| Main shell (bottom nav + FAB) | `/` `/settings` | ✅ | — |
| Viewport lock (no rubber-band, no zoom, `#root` is the scroll container) | app-wide | ✅ | — |
| Onboarding | `/onboarding` | ✅ | — |
| Render crash recovery (per-route and app-wide `ErrorBoundary`) | app-wide | ✅ | — |

## Product features

| Feature | Route | Code | Doc |
|---|---|---|---|
| <Your feature> | `/...` | ❌ | — |

## Infrastructure

| Feature | Code | Doc |
|---|---|---|
| PWA: install and self-update | ✅ | — |
| Data durability (`storage.persist`, surfaced write failures) | ✅ | — |
| JSON backup / restore (whole file validated before it is applied) | ✅ | — |
| Dark theme (system / light / dark, no flash on load) | ✅ | — |
| Localisation (vi/en) with a catalog integrity test | ✅ | — |

## Deliberately not built

| Feature | Reason |
|---|---|
| Accounts / sign-in | Local-first, no backend |
| Multi-device sync | See [ADR 001](../decisions/001-local-first-no-backend.md) |
