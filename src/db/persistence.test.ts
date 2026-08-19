import { afterEach, describe, expect, it, vi } from 'vitest'
import { estimateStorage, requestPersistentStorage } from './persistence'

/** jsdom ships no StorageManager, so each case installs the shape it needs. */
function stubStorage(value: unknown): void {
  Object.defineProperty(navigator, 'storage', {
    value,
    configurable: true,
    writable: true,
  })
}

afterEach(() => {
  Reflect.deleteProperty(navigator, 'storage')
})

describe('requestPersistentStorage', () => {
  it('reports the grant when the browser accepts', async () => {
    const persist = vi.fn().mockResolvedValue(true)
    stubStorage({ persisted: vi.fn().mockResolvedValue(false), persist })
    expect(await requestPersistentStorage()).toEqual({ supported: true, persisted: true })
    expect(persist).toHaveBeenCalledOnce()
  })

  it('reports a refusal without treating it as an error', async () => {
    stubStorage({
      persisted: vi.fn().mockResolvedValue(false),
      persist: vi.fn().mockResolvedValue(false),
    })
    expect(await requestPersistentStorage()).toEqual({ supported: true, persisted: false })
  })

  it('does not ask again when persistence is already granted', async () => {
    const persist = vi.fn().mockResolvedValue(true)
    stubStorage({ persisted: vi.fn().mockResolvedValue(true), persist })
    expect(await requestPersistentStorage()).toEqual({ supported: true, persisted: true })
    expect(persist).not.toHaveBeenCalled()
  })

  it('reports unsupported when the Storage API is absent', async () => {
    expect(await requestPersistentStorage()).toEqual({ supported: false, persisted: false })
  })

  it('reports unsupported when the API exists but is not callable', async () => {
    stubStorage({})
    expect(await requestPersistentStorage()).toEqual({ supported: false, persisted: false })
  })

  // Safari private browsing throws here instead of resolving false.
  it('swallows a throwing implementation instead of rejecting', async () => {
    stubStorage({
      persisted: vi.fn().mockRejectedValue(new SecurityError()),
      persist: vi.fn(),
    })
    await expect(requestPersistentStorage()).resolves.toEqual({
      supported: false,
      persisted: false,
    })
  })
})

describe('estimateStorage', () => {
  it('passes through usage and quota', async () => {
    stubStorage({ estimate: vi.fn().mockResolvedValue({ usage: 1024, quota: 2048 }) })
    expect(await estimateStorage()).toEqual({ usage: 1024, quota: 2048 })
  })

  it('normalizes missing fields to null', async () => {
    stubStorage({ estimate: vi.fn().mockResolvedValue({}) })
    expect(await estimateStorage()).toEqual({ usage: null, quota: null })
  })

  it('returns nulls when the API is absent or throws', async () => {
    expect(await estimateStorage()).toEqual({ usage: null, quota: null })
    stubStorage({ estimate: vi.fn().mockRejectedValue(new Error('nope')) })
    expect(await estimateStorage()).toEqual({ usage: null, quota: null })
  })
})

class SecurityError extends Error {
  constructor() {
    super('The operation is insecure.')
    this.name = 'SecurityError'
  }
}
