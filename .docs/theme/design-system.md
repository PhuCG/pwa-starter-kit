# Design system

Enforced by [`src/styles/tokens.css`](../../src/styles/tokens.css). This file explains
**why** the tokens hold the values they do and where they are used — it does not repeat
the list of values, because a copied list drifts.

**Rule 3 in `../../CLAUDE.md`: no raw hex and no raw px anywhere in `src/`.** Rebranding
means editing `tokens.css`. If editing it does not change the UI, that is a bug in the
component, not a reason to hardcode.

---

## Colour

| Token group | Used for |
|---|---|
| `--color-background` / `--color-surface` / `--color-surface-variant` | page background · card background · recessed fills (inputs, tracks) |
| `--color-primary` / `--color-secondary` | primary actions, active states, gradients |
| `--color-text-main` / `-sub` / `-muted` | body copy · secondary description · labels and placeholders |
| `--color-border` / `--color-border-strong` | card borders · focused input borders |
| `--color-success` / `-error` / `-warning` / `-info` | status feedback |
| `--color-positive` / `--color-negative` | directional values (up/down, in/out) |
| `--color-on-accent` | text and icons sitting on a saturated fill |
| `--color-inverse-surface` / `--color-on-inverse` | the toast and anything else that deliberately contrasts with the page |
| `--color-scrim` | behind sheets and dialogs |
| `--chart-1..7` (+ `-light`) | chart series, cycled by index |

Three things that are easy to get wrong:

- **`--color-primary` is duplicated in three places** because the browser needs the
  chrome colour before any CSS loads: `APP.themeColor` in `src/app.config.ts`, the
  `<meta name="theme-color">` tag in `index.html`, and this token. `npm run init`
  rewrites all three together — never edit them one at a time.
- **Semantic colour is directional, not decorative.** Use `--color-positive` for a rising
  figure, not `--color-success`: the two can diverge, and in the dark theme they do.
- **Chart series have `-light` variants** so an area fill or a label background never
  needs a hand-mixed alpha.

## Dark theme

The dark palette sits behind **one selector**: `:root[data-theme="dark"]`.

**CSS never reads `prefers-color-scheme` directly.** If it did, the media query would
keep applying the OS scheme after the user explicitly picked the other one, and the two
sources would disagree silently. Instead:

1. [`src/lib/theme.ts`](../../src/lib/theme.ts) resolves the preference (`system` /
   `light` / `dark`) into that attribute, and updates the
   `<meta name="theme-color">` tag with it — on an installed PWA that tag is the status
   bar colour.
2. An **inline script in `index.html`** runs before the first paint and sets the same
   attribute; without it a dark-mode user gets a white flash on every cold start. That
   script keeps its own copy of the storage key — `npm run init` rewrites both.

Three token groups deliberately do **not** change with the scheme:

- `--color-on-accent` — text and icons **on** a saturated fill (primary, gradient,
  danger). The fill stays saturated in dark mode, so the contrast is already correct and
  flipping it would make the text unreadable.
- **Gradients** — they carry the brand.
- **Spacing, radius and the type scale** — geometry has no business changing with colour.

What does change, and is easy to forget: `--color-primary` lightens to `#818cf8`, because
the light indigo fails contrast on a near-black surface; and shadows carry almost no
signal on a dark background, so elevation there comes from `--color-surface` being
lighter than `--color-background`.

## Spacing

A scale from `--sp-xxs` (2px) to `--sp-massive` (64px). Only use steps on the scale — a
value that is not on it usually means the layout is compensating for something else.

The default rhythm: card padding `--sp-lg`, gap between cards `--sp-md`, gap between
groups `--sp-xl`.

## Radius

`--radius-xs` (4px) through `--radius-xxl` (24px), plus `--radius-full` for pills and
avatars. Cards use `--radius-lg`; sheets use `--radius-xxl` on their top two corners.

## Shadow

`--shadow-card` · `--shadow-card-hover` · `--shadow-button` · `--shadow-floating` ·
`--shadow-raised`.

**A card has a border OR a shadow, never both** (rule 6). Both at once draws two
separators for one edge and makes the UI look heavy.

## Type

The `.text-*` utility classes in `tokens.css`, never a loose `font-size`:

| Group | Classes | Used for |
|---|---|---|
| Headline | `.text-headline-m` `.text-headline-s` | page titles, hero figures |
| Title | `.text-title-l` `.text-title-m` `.text-title-s` | section and card titles |
| Body | `.text-body-l` `.text-body-m` `.text-body-s` | copy, descriptions |
| Label | `.text-label-l` `.text-label-m` `.text-label-s` | form labels, tab labels, captions |

Typeface: Plus Jakarta Sans, self-hosted in `public/fonts/`, two weights preloaded in
`index.html`. To change it, see [`public/README.md`](../../public/README.md).

## Layout

- `--page-max-width` (480px): both `#root` and the bottom nav are capped here, so on a
  tablet the app stays a centred phone column instead of stretching out of proportion.
- `--bottom-nav-height` + `--safe-bottom`: the bottom padding of `.page` must include
  both, or the last item on a page hides under the nav bar.
- `--viewport-height` / `--viewport-bottom-inset`: **measured** by
  [`src/pwa/viewportInsets.ts`](../../src/pwa/viewportInsets.ts), not constants. Use them
  instead of `100dvh` when you need the part of the screen actually visible — iOS does
  not resize the layout viewport for the keyboard.

## Motion

Short (120–200ms) and limited to `transform` and `opacity`. `global.css` already honours
`prefers-reduced-motion` by cutting durations to near zero — near, not zero, so
`transitionend` listeners still fire and nothing waiting on them can hang.

## Icons

Only through `<AppIcon name="..."/>`. No emoji, no text glyphs used as icons (rule 1).
Adding one means adding a line to `ICON_REGISTRY` in
[`src/components/ui/icons.tsx`](../../src/components/ui/icons.tsx), named for its
**meaning** (`pin`, `back`) rather than its **picture** (`thumbtack`, `chevronLeft`).
