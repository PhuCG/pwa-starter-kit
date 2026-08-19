/**
 * Storage durability. The app is local-first with no backend, so an evicted
 * IndexedDB is permanent data loss.
 *
 * `navigator.storage.persist()` exempts the origin from eviction on Chromium
 * and Firefox. iOS Safari ignores it — there, the exemption comes from the
 * user installing the PWA to the Home Screen, which is why the install prompt
 * and the JSON backup export are the real mitigations on that platform.
 *
 * Every call here is defensive: the Storage API is missing in older Safari and
 * throws outright in some private-browsing modes. A failure to secure
 * persistence must never keep the app from starting.
 */

export type PersistenceState =
  /** Storage API missing — nothing to ask, nothing to promise. */
  | { supported: false; persisted: false }
  /** Asked and answered. `persisted: false` means eviction is still possible. */
  | { supported: true; persisted: boolean }

export const UNSUPPORTED: PersistenceState = { supported: false, persisted: false }

function storageManager(): StorageManager | null {
  if (typeof navigator === 'undefined') return null
  const sm = navigator.storage
  if (!sm || typeof sm.persist !== 'function' || typeof sm.persisted !== 'function') return null
  return sm
}

/**
 * Ask the browser to make this origin's storage persistent, skipping the ask
 * when it is already granted. Never rejects.
 */
export async function requestPersistentStorage(): Promise<PersistenceState> {
  const sm = storageManager()
  if (!sm) return UNSUPPORTED
  try {
    if (await sm.persisted()) return { supported: true, persisted: true }
    return { supported: true, persisted: await sm.persist() }
  } catch {
    return UNSUPPORTED
  }
}

export interface StorageEstimate {
  /** Bytes currently used by this origin, or null when unavailable. */
  usage: number | null
  /** Bytes the origin may use, or null when unavailable. */
  quota: number | null
}

/** Quota reading for the storage section in Profile. Never rejects. */
export async function estimateStorage(): Promise<StorageEstimate> {
  const empty: StorageEstimate = { usage: null, quota: null }
  if (typeof navigator === 'undefined' || typeof navigator.storage?.estimate !== 'function') {
    return empty
  }
  try {
    const { usage, quota } = await navigator.storage.estimate()
    return { usage: usage ?? null, quota: quota ?? null }
  } catch {
    return empty
  }
}
