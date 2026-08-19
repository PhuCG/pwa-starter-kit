# 001. Local-first, no backend

> Status: Accepted
> Date: <YYYY-MM-DD>

## Context

A personal app: one user, one device, no need to share data between people. A backend
would mean monthly infrastructure cost, sign-in, a privacy policy, and a single point of
failure whenever the network is down.

## Decision

All data lives in IndexedDB (Dexie) on the user's device. No auth, no sync, no server.

## Alternatives considered

| Option | Why not |
|---|---|
| Firebase / Supabase | Brings auth and sync, but also cost, a network dependency, and responsibility for other people's data |
| localStorage | Synchronous, blocks the main thread, roughly 5MB, no indexes |
| In memory plus manual export | Loses everything when the tab closes |

## Consequences

**Gained:** works fully offline; nothing to operate; no risk of leaking user data because
we hold none; instant startup because nothing waits on the network.

**Given up:** no multi-device use. Nothing to recover from if the user loses the device.

**Made harder later:** the browser **is allowed to evict** IndexedDB when the device runs
low on space, and eviction is permanent. Three defences are therefore mandatory:

1. `navigator.storage.persist()` at startup — effective on Chromium and Firefox only.
2. On iOS Safari the eviction exemption arrives only when the user **installs the PWA to
   the home screen** → the install card is a data-protection measure, not marketing.
3. The JSON export is the only backup the user genuinely owns.

Adding sync later will cost: every table would need a merge key and a write timestamp,
neither of which the current schema has.
