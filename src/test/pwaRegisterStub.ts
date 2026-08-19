/**
 * Stand-in for `virtual:pwa-register/react`, which only exists inside a Vite
 * build. Aliased in `vitest.config.ts`; every suite that cares replaces it with
 * `vi.mock`, so reaching this body means a component registered a service
 * worker in a test that never meant to.
 */
export function useRegisterSW() {
  return {
    needRefresh: [false, () => {}] as [boolean, (v: boolean) => void],
    offlineReady: [false, () => {}] as [boolean, (v: boolean) => void],
    updateServiceWorker: async (_reloadPage?: boolean) => {},
  }
}
