import { storageKey } from '@/app.config'
import { EMPTY_PROFILE, type Profile } from '@/domain/types'

/**
 * localStorage-backed scalar preferences — the things that are too small to
 * deserve a Dexie table and are read synchronously at startup.
 *
 * The rules that make this safe:
 *
 * - **Every access is wrapped.** localStorage throws outright in Safari private
 *   mode and when the quota is full; a preference failing to load must never
 *   keep the app from starting, so every getter degrades to a default.
 * - **Every key goes through `storageKey`,** so one app never reads another
 *   app's values on a shared origin (localhost, or a preview domain).
 * - **Only scalars and small JSON blobs.** Anything that grows with usage is a
 *   Dexie table — localStorage is synchronous and blocks the main thread.
 */

const K = {
  locale: storageKey('locale'),
  userName: storageKey('user_name'),
  hasCompletedOnboarding: storageKey('has_completed_onboarding'),
} as const

function getString(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

function setString(key: string, value: string): void {
  try {
    localStorage.setItem(key, value)
  } catch {
    /* storage full or blocked — in-memory state still works this session */
  }
}

export function getJSON<T>(key: string): T | null {
  const raw = getString(key)
  if (raw === null) return null
  try {
    return JSON.parse(raw) as T
  } catch {
    return null
  }
}

export interface ScalarState {
  locale: string | null
  profile: Profile
}

export function loadScalars(): ScalarState {
  return {
    locale: getString(K.locale),
    profile: {
      userName: getString(K.userName) ?? EMPTY_PROFILE.userName,
      hasCompletedOnboarding: getString(K.hasCompletedOnboarding) === 'true',
    },
  }
}

export const saveLocale = (locale: string) => setString(K.locale, locale)

export function saveProfile(p: Profile): void {
  setString(K.userName, p.userName)
  setString(K.hasCompletedOnboarding, String(p.hasCompletedOnboarding))
}
