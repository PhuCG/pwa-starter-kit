# App flows

Each file describes one flow: its routes, the order of its screens, the conditions that
move between them, and the UI states of each screen. Name them `NN_<slug>.md` so the
file order matches the order a user meets them.

| File | Flow |
|---|---|
| [_TEMPLATE.md](./_TEMPLATE.md) | Copy this |
| `01_onboarding.md` | <not written> |
| `02_home.md` | <not written> |

## Current route map

Source: [`src/routes.tsx`](../../src/routes.tsx). The only guard is
`profile.hasCompletedOnboarding` — no screen redirects from inside its own render, so
there is never a second guard to disagree with it.

| Route | In the shell? | Screen |
|---|---|---|
| `/onboarding` | no | `OnboardingPage` |
| `/` | yes | `HomePage` |
| `/settings` | yes | `SettingsPage` |
| `*` | — | redirect to `/` |
