# <PROJECT NAME> — Documentation

This repo is the **source of truth** for product behaviour. Where the code and the docs
disagree, the docs record the intent — fix whichever one is wrong, but never leave the
disagreement standing.

Docs describe **behaviour and reasoning**, not the code. If a passage only makes sense
with the code open beside it, it belongs in a comment, not here.

---

## Map

| Directory / file | Contents | Role |
|---|---|---|
| [features/](./features/) | Per-feature status and detail | **Updated on every code change** |
| [app_flow/](./app_flow/) | Navigation, screens, UI states | Behaviour spec |
| [domain_rules.md](./domain_rules.md) | Every business rule and validation constraint | Source of truth for `src/domain/` |
| [decisions/](./decisions/) | ADRs — architectural decisions and what was rejected | The record of why |
| [theme/design-system.md](./theme/design-system.md) | Colour, typography, spacing, dark theme | The source of `src/styles/tokens.css` |

Add as the project needs them: `screenshots/` (visual reference), `research/`
(interviews, competitive analysis), `revenue/` (business model).

---

## Documentation rules (non-negotiable)

Every change to feature behaviour ships its doc in the same commit. Not "later".

1. **Feature added or changed** → update `features/<feature>.md` (create it from
   [`features/_TEMPLATE.md`](./features/_TEMPLATE.md) if missing) and its row in
   [`features/README.md`](./features/README.md).
2. **Business rule changed** → update [`domain_rules.md`](./domain_rules.md) in the
   **same commit** as the change to `src/domain/` and its test.
3. **Route, screen or UI state changed** → update the matching file in
   [`app_flow/`](./app_flow/).
4. **Design token changed** → update
   [`theme/design-system.md`](./theme/design-system.md).
5. **A decision with a real alternative** (chose A over B, and what it costs) → write an
   ADR in [`decisions/`](./decisions/).
6. **A project-wide constraint, or something deliberately not built** → a numbered rule
   in [`../CLAUDE.md`](../CLAUDE.md), plus the **Decisions** section of the feature doc.

---

## Project-specific notes

List what this project does **deliberately** differently, so nobody "corrects" it:

- **Local-first, no backend.** No auth, no sync. The only guard is
  `hasCompletedOnboarding`. See [ADR 001](./decisions/001-local-first-no-backend.md).
- **The JSON backup file is the only copy the user owns.** A file must be valid in full
  before any of it is applied — there is no half restore.
- **Dark theme reads only `data-theme`**, never `prefers-color-scheme` in CSS. How and
  why: [theme/design-system.md](./theme/design-system.md).
- **<Your next difference — delete this line if there is none.>**
