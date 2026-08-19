# Luồng màn hình

Mỗi file mô tả một luồng: route, thứ tự màn hình, điều kiện chuyển, và state UI của
từng màn. Đặt tên `NN_<slug>.md` để thứ tự file khớp thứ tự người dùng gặp.

| File | Luồng |
|---|---|
| [_TEMPLATE.md](./_TEMPLATE.md) | Mẫu để copy |
| `01_onboarding.md` | <chưa viết> |
| `02_home.md` | <chưa viết> |

## Bản đồ route hiện tại

Nguồn: [`src/routes.tsx`](../../src/routes.tsx). Guard duy nhất là
`profile.hasCompletedOnboarding` — không màn hình nào được tự redirect từ trong render
của nó.

| Route | Trong shell? | Màn hình |
|---|---|---|
| `/onboarding` | không | `OnboardingPage` |
| `/` | có | `HomePage` |
| `/settings` | có | `SettingsPage` |
| `*` | — | redirect về `/` |
