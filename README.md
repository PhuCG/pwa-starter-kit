# PWA Starter

Bộ khung để bắt đầu một dự án **PWA local-first**: React 18 + Vite + TypeScript,
dữ liệu nằm hoàn toàn trên máy người dùng (IndexedDB qua Dexie), không backend.

Đây là bản trích ra từ [chill_money_web](../chill_money/chill_money_web) — giữ lại
phần hạ tầng, luật và tài liệu, bỏ phần nghiệp vụ tài chính.

## Dùng như thế nào

```bash
git clone <repo-url> my-app && cd my-app
npm install
npm run init          # đặt tên, slug, màu, locale — ghi lại 5 chỗ định danh
npm run dev
```

`npm run init` cũng chạy được không tương tác:

```bash
node scripts/init-project.mjs --name "Sổ Thói Quen" --slug habit-log --short "Thói quen" --color "#0ea5e9" --locale vi --yes --fresh-git
```

Sau đó theo checklist mà script in ra: thay icon trong `public/`, hoàn thiện bảng màu
trong `src/styles/tokens.css`, thay entity mẫu `Note` bằng entity thật, và viết lại
các chỗ `<placeholder>` trong `CLAUDE.md` + `.docs/`.

## Có sẵn những gì

| Lớp | Nội dung |
|---|---|
| **Build** | Vite 6, TypeScript strict (`noUncheckedIndexedAccess`), Biome (lint + format), Vitest + jsdom + fake-indexeddb, `npm run check` gộp cả ba |
| **PWA** | vite-plugin-pwa, service worker tự cập nhật + giải thích lần reload, thẻ mời cài đặt (Android/iOS), khóa viewport, đo inset bàn phím iOS |
| **Dữ liệu** | Dexie (`src/db/db.ts`), repo là nơi duy nhất chạm Dexie, ghi lỗi được báo chứ không nuốt, `navigator.storage.persist()` |
| **State** | zustand, hydrate là state machine (`idle/loading/ready/error`) có retry, selector memo hóa |
| **Domain** | TS thuần, `constraints.ts` gom mọi invariant, `dates.ts` xử lý key `yyyy-MM-dd` |
| **UI kit** | Card, Button, Sheet (vaul), Dialog, EmptyState, ProgressBar, DateField, MonthNavigator, SegmentedToggle, Toast, Skeleton, HalfDonutGauge — tất cả ăn design token |
| **i18n** | i18next + ICU, 2 locale mẫu, test tự phát hiện key thiếu / copy chết / lệch locale / emoji |
| **Docs** | `.docs/` với template cho feature, app flow, ADR, design system |
| **Quy trình** | `CLAUDE.md` (luật + workflow), `.claude/launch.json`, CI GitHub Actions |
| **Deploy** | `vercel.json` — SPA rewrite + header cache cho SW/assets/fonts |

## Lệnh

```bash
npm run dev        # vite dev server, cổng 5173
npm run check      # lint + typecheck + test — đúng thứ CI chạy
npm run build      # tsc -b && vite build
npm run preview    # xem thử bản build, cổng 4173
```

## Cấu trúc

```
src/
├── app.config.ts        định danh app — nơi duy nhất chứa tên/màu/prefix storage
├── main.tsx             thứ tự khởi động: khóa viewport → i18n → render
├── App.tsx              3 trạng thái khởi động (splash / lỗi có retry / sẵn sàng)
├── routes.tsx           route lazy + guard onboarding
├── components/ui/       UI kit dùng chung + icon registry
├── db/                  Dexie schema, repo, localStorage scalars, persistence
├── domain/              TS thuần: types, invariants, luật nghiệp vụ (có test)
├── features/            màn hình — không tính toán, không chạm Dexie
├── lib/                 i18n, sinh id
├── pwa/                 service worker, thẻ cài đặt, khóa viewport, inset bàn phím
├── store/               zustand store + selectors
└── styles/              tokens.css (design token) + global.css (reset + viewport lock)
```

Chi tiết luật và lý do từng quyết định: [CLAUDE.md](CLAUDE.md) và [.docs/](.docs/README.md).

## Ví dụ mẫu cần xóa

Entity `Note` chỉ để minh họa contract (validate ở UI → assert ở store → ghi qua repo).
Khi có entity thật thì xóa nó ở: `src/domain/types.ts`, `src/domain/constraints.ts`,
`src/db/db.ts`, `src/db/repo.ts`, phần notes trong `src/store/appStore.ts`,
`src/store/selectors.ts`, `src/features/home/`, và các key `note*` trong `i18n/`.
