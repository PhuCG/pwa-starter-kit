# Static assets

Everything here is copied to the site root as-is.

## Icons — replace these

They are still the starter's placeholders. The set the manifest and iOS expect:

| File | Size | Used by |
|---|---|---|
| `favicon.ico` | 48×48 | browser tab |
| `apple-touch-icon-180x180.png` | 180×180 | iOS home screen |
| `pwa-64x64.png` | 64×64 | manifest |
| `pwa-192x192.png` | 192×192 | manifest, Android launcher |
| `pwa-512x512.png` | 512×512 | manifest, splash |
| `maskable-icon-512x512.png` | 512×512 | Android adaptive icon |

The maskable one is not the same image scaled: Android crops it to a circle or a
squircle, so keep the artwork inside the middle 80% or it loses its edges.

Generating all six from one 1024×1024 source:

```bash
npx pwa-asset-generator icon.png public --icon-only --favicon --opaque false
```

## Fonts

`fonts/` holds Plus Jakarta Sans (SIL Open Font License) as woff2, self-hosted and
preloaded in `index.html`. Self-hosted rather than from a CDN so the app renders its
own typeface offline — a webfont fetch that fails is a visible layout shift on every
cold start. Swapping typefaces means replacing these files, the `@font-face` blocks in
`src/styles/global.css`, the two `<link rel="preload">` tags, and `--font-sans` in
`src/styles/tokens.css`.
