# Architecture Decision Records

One ADR per decision that had a **real alternative** and is **hard to reverse**. Not for
naming a variable; for choosing Dexie over localStorage, local-first over a backend,
zustand over Redux.

Name them `NNN-<slug>.md`, numbered upward, never reusing a number.

An ADR is **not edited after it is accepted**. When you change your mind, write a new one
and mark the old `Superseded by NNN`. The value of an ADR is that it records what you
believed at the time — including when that turned out to be wrong.

| # | Decision | Status |
|---|---|---|
| [001](./001-local-first-no-backend.md) | Local-first, no backend | Accepted |
