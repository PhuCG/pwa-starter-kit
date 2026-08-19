import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { storageKey } from './app.config'
import { detectLocale, initI18n } from './lib/i18n'
import { trackViewportInsets } from './pwa/viewportInsets'
import { lockViewport } from './pwa/viewportLock'
import './styles/global.css'

/**
 * Startup order matters:
 *
 * 1. The viewport lock goes on before anything paints, so the first touch on a
 *    slow first load cannot rubber-band the page.
 * 2. i18n is *awaited*. Rendering first and swapping the language in would
 *    flash English at a Vietnamese user, which is worse than 20ms of blank.
 * 3. Data hydration is NOT awaited here — it happens inside `App`, which can
 *    show a splash and, if it fails, a retry.
 */
async function bootstrap() {
  lockViewport()
  trackViewportInsets()

  const savedLocale = (() => {
    try {
      return localStorage.getItem(storageKey('locale'))
    } catch {
      return null
    }
  })()
  await initI18n(detectLocale(savedLocale))

  const rootEl = document.getElementById('root')
  if (!rootEl) throw new Error('#root missing')
  createRoot(rootEl).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}

void bootstrap()
