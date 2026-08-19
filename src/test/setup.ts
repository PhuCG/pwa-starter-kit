import 'fake-indexeddb/auto'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

/**
 * Shared test environment. Every suite runs against jsdom with a real (fake)
 * IndexedDB, so store and repo tests exercise the same code path as the app
 * instead of a mock. Unmount React trees between tests — a leaked tree keeps
 * its store subscription alive and pollutes render-count assertions.
 */

// setupFiles also run for suites that opt out of jsdom (`@vitest-environment
// node`), so the DOM teardown has to be conditional.
const hasDom = typeof window !== 'undefined'

afterEach(() => {
  if (!hasDom) return
  cleanup()
  localStorage.clear()
})
