import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import { VitePWA } from 'vite-plugin-pwa'
import { APP } from './src/app.config'

const root = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      // `prompt`, but nothing is ever prompted: ServiceWorkerUpdater applies
      // the new build on its own. The mode is only about WHO calls
      // `skipWaiting()` — `autoUpdate` does it inside the plugin and reloads
      // with no hook to paint anything first, which is exactly the "app blinks
      // and my screen is gone" moment we want to explain.
      registerType: 'prompt',
      includeAssets: ['fonts/*.woff2', 'favicon.ico', 'apple-touch-icon-180x180.png'],
      // Uncomment to exercise the service worker (and ServiceWorkerUpdater)
      // against `npm run dev`. Off by default: a live worker in dev serves
      // cached modules and the updater's poll can reload the page mid-edit.
      // devOptions: { enabled: true },
      manifest: {
        name: APP.name,
        short_name: APP.shortName,
        description: APP.description,
        lang: APP.defaultLocale,
        theme_color: APP.themeColor,
        background_color: APP.backgroundColor,
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        // The app's stable identity, and the one manifest field that is
        // genuinely dangerous to omit: with no `id`, the browser derives
        // identity from `start_url`, so changing `start_url` later makes an
        // installed app look like a DIFFERENT app — existing users get a
        // duplicate instead of an update, with their IndexedDB left behind.
        id: '/',
        // Reuse an already-open window instead of spawning a second one. Two
        // instances of a local-first app means two Dexie connections to the
        // same database, which is exactly what blocks a version upgrade.
        launch_handler: { client_mode: 'focus-existing' },
        categories: ['productivity'],
        // Chrome on Android only shows the rich install dialog — the large one
        // with a description and images, rather than the dismissible mini
        // infobar — when screenshots with a `form_factor` are present.
        // `public/screenshots/*` are placeholders; see `public/README.md`.
        screenshots: [
          {
            src: 'screenshots/narrow.png',
            sizes: '1080x1920',
            type: 'image/png',
            form_factor: 'narrow',
            label: `${APP.name} on a phone`,
          },
          {
            src: 'screenshots/wide.png',
            sizes: '1920x1080',
            type: 'image/png',
            form_factor: 'wide',
            label: `${APP.name} on a desktop`,
          },
        ],
        // Long-press the installed icon to jump straight to a route. Add one
        // per task a user repeats; drop the array if there is none.
        shortcuts: [
          {
            name: 'Settings',
            short_name: 'Settings',
            description: 'Open settings, backup and restore',
            url: '/settings',
            icons: [{ src: 'pwa-192x192.png', sizes: '192x192' }],
          },
        ],
        icons: [
          { src: 'pwa-64x64.png', sizes: '64x64', type: 'image/png' },
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,woff2,png,svg,ico}'],
        navigateFallback: '/index.html',
        // Screenshots are install-dialog artwork the running app never loads.
        // Precaching them would add megabytes to the install of every user.
        globIgnores: ['**/screenshots/*'],
      },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(root, 'src') },
  },
  build: {
    // Worth the extra files: with no backend there are no server secrets in
    // the bundle, and a user-reported crash is otherwise unreadable — minified
    // frames in a screenshot of a phone are not a bug report.
    sourcemap: true,
    rollupOptions: {
      output: {
        // Split what changes rarely from what changes on every deploy, so a
        // returning user re-downloads the app and not the framework.
        manualChunks: {
          react: ['react', 'react-dom', 'react-router'],
          i18n: ['i18next', 'react-i18next', 'i18next-icu', 'intl-messageformat'],
        },
      },
    },
  },
})
