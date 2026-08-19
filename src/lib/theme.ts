import { APP } from '@/app.config'

/**
 * Colour scheme: resolves a preference into the `data-theme` attribute that
 * `src/styles/tokens.css` keys its dark palette off.
 *
 * The whole design rests on one decision: **CSS never reads
 * `prefers-color-scheme` directly.** A media query there would keep applying
 * the OS scheme even after the user explicitly picked the other one, and the
 * two would silently disagree. So the OS preference is read here, in one place,
 * and the result is written as an attribute — one source of truth.
 *
 * The cost of that is a flash of light theme before this module loads, which is
 * why `index.html` carries an inline copy of `resolve()` that runs before the
 * first paint. **The storage key is duplicated there** — `npm run init` rewrites
 * both, so change the prefix through the script, never by hand.
 */
export const THEME_PREFERENCES = ['system', 'light', 'dark'] as const
export type ThemePreference = (typeof THEME_PREFERENCES)[number]
/** What the preference actually resolved to right now. */
export type ResolvedTheme = 'light' | 'dark'

export const THEME_STORAGE_KEY = `${APP.storagePrefix}_theme`

const DARK_QUERY = '(prefers-color-scheme: dark)'

export function isThemePreference(v: unknown): v is ThemePreference {
  return typeof v === 'string' && (THEME_PREFERENCES as readonly string[]).includes(v)
}

export function loadThemePreference(): ThemePreference {
  try {
    const saved = localStorage.getItem(THEME_STORAGE_KEY)
    return isThemePreference(saved) ? saved : 'system'
  } catch {
    return 'system'
  }
}

export function saveThemePreference(preference: ThemePreference): void {
  try {
    localStorage.setItem(THEME_STORAGE_KEY, preference)
  } catch {
    /* storage blocked — the theme still applies for this session */
  }
}

export function systemPrefersDark(): boolean {
  return typeof matchMedia === 'function' && matchMedia(DARK_QUERY).matches
}

export function resolveTheme(preference: ThemePreference): ResolvedTheme {
  if (preference === 'system') return systemPrefersDark() ? 'dark' : 'light'
  return preference
}

/**
 * Write the resolved theme where CSS and the browser chrome can see it.
 *
 * The `theme-color` meta matters more than it looks: on an installed PWA it is
 * the colour of the status bar and the task-switcher card, so leaving it at the
 * light brand colour puts a bright band above a dark app.
 */
export function applyTheme(preference: ThemePreference): ResolvedTheme {
  const resolved = resolveTheme(preference)
  document.documentElement.setAttribute('data-theme', resolved)

  const meta = document.querySelector('meta[name="theme-color"]')
  if (meta) {
    meta.setAttribute('content', resolved === 'dark' ? APP.backgroundColorDark : APP.themeColor)
  }
  return resolved
}

/**
 * Re-apply when the OS scheme changes, but only while the preference is
 * `system` — an explicit choice must survive the user's phone going into night
 * mode. Returns an unsubscribe function.
 */
export function watchSystemTheme(onChange: () => void): () => void {
  if (typeof matchMedia !== 'function') return () => {}
  const query = matchMedia(DARK_QUERY)
  query.addEventListener('change', onChange)
  return () => query.removeEventListener('change', onChange)
}
