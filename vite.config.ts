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
      },
    }),
  ],
  resolve: {
    alias: { '@': path.resolve(root, 'src') },
  },
  build: {
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
