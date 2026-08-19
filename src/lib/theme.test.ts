import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  THEME_STORAGE_KEY,
  applyTheme,
  isThemePreference,
  loadThemePreference,
  resolveTheme,
  saveThemePreference,
} from './theme'

/** jsdom has no matchMedia; every test states the OS scheme it assumes. */
function stubSystem(dark: boolean) {
  vi.stubGlobal('matchMedia', (query: string) => ({
    matches: dark && query.includes('dark'),
    addEventListener: () => {},
    removeEventListener: () => {},
  }))
}

afterEach(() => {
  vi.unstubAllGlobals()
  document.documentElement.removeAttribute('data-theme')
})

describe('preference storage', () => {
  it('defaults to system, including when the stored value is junk', () => {
    expect(loadThemePreference()).toBe('system')
    localStorage.setItem(THEME_STORAGE_KEY, 'sepia')
    expect(loadThemePreference()).toBe('system')
  })

  it('round-trips a real choice', () => {
    saveThemePreference('dark')
    expect(loadThemePreference()).toBe('dark')
  })

  it('rejects anything that is not a preference', () => {
    expect(isThemePreference('light')).toBe(true)
    expect(isThemePreference('')).toBe(false)
    expect(isThemePreference(null)).toBe(false)
  })
})

describe('resolveTheme', () => {
  it('follows the OS only for `system`', () => {
    stubSystem(true)
    expect(resolveTheme('system')).toBe('dark')
    expect(resolveTheme('light')).toBe('light')
  })

  it('keeps an explicit dark choice on a light OS', () => {
    stubSystem(false)
    expect(resolveTheme('dark')).toBe('dark')
    expect(resolveTheme('system')).toBe('light')
  })
})

describe('applyTheme', () => {
  it('writes the attribute CSS keys off', () => {
    stubSystem(true)
    expect(applyTheme('system')).toBe('dark')
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark')
  })

  it('repaints the browser chrome so the status bar is not left bright', () => {
    stubSystem(false)
    const meta = document.createElement('meta')
    meta.setAttribute('name', 'theme-color')
    meta.setAttribute('content', '#4f46e5')
    document.head.appendChild(meta)

    applyTheme('dark')
    const dark = meta.getAttribute('content')
    applyTheme('light')

    expect(dark).not.toBe(meta.getAttribute('content'))
    meta.remove()
  })
})
