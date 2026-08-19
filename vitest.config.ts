import { defineConfig } from 'vitest/config'

export default defineConfig({
  resolve: {
    alias: {
      '@': new URL('./src', import.meta.url).pathname,
      // Only the Vite build generates this module. Aliasing it to a stub gives
      // `vi.mock` something to resolve, which is what lets a test stand in for
      // "a new build just landed".
      'virtual:pwa-register/react': new URL(
        './src/test/pwaRegisterStub.ts',
        import.meta.url,
      ).pathname,
    },
  },
  test: {
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    setupFiles: ['src/test/setup.ts'],
  },
})
