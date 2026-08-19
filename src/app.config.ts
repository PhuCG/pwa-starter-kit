/**
 * Everything that makes this app *this* app, in one file.
 *
 * `scripts/init-project.mjs` rewrites exactly these values when you spin a new
 * project out of the starter, so nothing else in `src/` should ever hardcode a
 * product name, a colour, or a storage key. Imported by `vite.config.ts` too —
 * keep it free of DOM and Node APIs so both sides can read it.
 */
export const APP = {
  /** Full product name: document title, PWA manifest, splash. */
  name: 'PWA Starter',
  /** Home-screen label. Keep under ~12 characters or iOS truncates it. */
  shortName: 'Starter',
  description: 'A local-first PWA starter',
  /** Browser chrome colour; must match `--color-primary` in tokens.css. */
  themeColor: '#4f46e5',
  /** Splash background; must match `--color-background` in tokens.css. */
  backgroundColor: '#f8fafc',
  /**
   * Status-bar colour while the dark theme is active; must match
   * `--color-background` under `[data-theme="dark"]` in tokens.css. Not used by
   * the manifest — the manifest has one background colour — only by
   * `src/lib/theme.ts` when it rewrites the `theme-color` meta.
   */
  backgroundColorDark: '#0b1120',
  /**
   * Namespaces every localStorage key. The `_v1` is deliberate: a breaking
   * change to the shape of a stored value bumps the prefix instead of writing a
   * migration for data that is, by definition, cheap to lose.
   */
  storagePrefix: 'app_v1',
  /** IndexedDB database name. Changing it after ship orphans existing data. */
  dbName: 'pwa_starter',
  defaultLocale: 'vi',
} as const

/** `app_v1_foo` — the only way a storage key should ever be built. */
export const storageKey = (name: string) => `${APP.storagePrefix}_${name}`
