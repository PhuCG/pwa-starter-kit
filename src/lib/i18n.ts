import { APP } from '@/app.config'
import i18next from 'i18next'
import ICU from 'i18next-icu'
import { initReactI18next } from 'react-i18next'

import en from '../../i18n/en.json'
import vi from '../../i18n/vi.json'

/**
 * ICU message format (not i18next's own interpolation) so plurals and gendered
 * copy are expressible in the catalog instead of being assembled in a
 * component. `initI18n` is awaited in `main.tsx` before the first render — a
 * suspended-then-swapped first paint is worse than 20ms of blank screen.
 *
 * Adding a locale: drop `i18n/<tag>.json` in, add it to both maps below.
 * `i18n.integrity.test.ts` then enforces that it has the same keys as `en`.
 */
export const SUPPORTED_LOCALES = ['vi', 'en'] as const
export type AppLocale = (typeof SUPPORTED_LOCALES)[number]

const RESOURCES: Record<AppLocale, Record<string, string>> = { vi, en }

export const isSupportedLocale = (v: string): v is AppLocale =>
  (SUPPORTED_LOCALES as readonly string[]).includes(v)

export function detectLocale(saved: string | null): AppLocale {
  if (saved && isSupportedLocale(saved)) return saved
  const nav = typeof navigator !== 'undefined' ? navigator.language : APP.defaultLocale
  const short = nav.slice(0, 2)
  if (isSupportedLocale(short)) return short
  return APP.defaultLocale as AppLocale
}

export function initI18n(initialLocale: AppLocale): Promise<unknown> {
  return i18next
    .use(ICU)
    .use(initReactI18next)
    .init({
      lng: initialLocale,
      fallbackLng: APP.defaultLocale,
      resources: Object.fromEntries(
        SUPPORTED_LOCALES.map((l) => [l, { translation: RESOURCES[l] }]),
      ),
      interpolation: { escapeValue: false },
      // An empty string in a catalog is a missing translation, not a
      // deliberate blank — fall back rather than render nothing.
      returnEmptyString: false,
    })
}

export default i18next
