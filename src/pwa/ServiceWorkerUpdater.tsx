import { useRegisterSW } from 'virtual:pwa-register/react'
import { storageKey } from '@/app.config'
import { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import './updater.css'

/** How often to re-fetch `sw.js` while the app is open and in the foreground. */
const POLL_MS = 60_000
/** How often to re-test "is the user in the middle of something" while waiting. */
const BUSY_RETRY_MS = 1_000
/** How long to wait for the new worker to take over before reloading anyway. */
const TAKEOVER_TIMEOUT_MS = 8_000
/** Set once we have reloaded on the timeout above, so we never loop on it. */
const FALLBACK_KEY = storageKey('sw_reload_fallback')

/**
 * True when reloading right now would throw away something the user is in the
 * middle of. Two signals cover every case this app has: a focused text field,
 * and an open sheet (vaul locks the body while a drawer is up).
 */
function isBusy(): boolean {
  if (document.body.hasAttribute('data-scroll-locked')) return true
  const el = document.activeElement
  if (!el) return false
  return (
    el instanceof HTMLInputElement ||
    el instanceof HTMLTextAreaElement ||
    el instanceof HTMLSelectElement ||
    (el instanceof HTMLElement && el.isContentEditable)
  )
}

/**
 * Keeps the installed app on the latest build, and says so while it happens.
 *
 * Three separate things have to be true for a deploy to reach a phone that
 * already has the app installed, and each one is a place this used to fail:
 *
 * 1. **Someone has to ask.** A standalone iOS PWA resumed from the app switcher
 *    does not re-navigate, so the browser never re-fetches `sw.js` on its own —
 *    the app could sit on a stale build until it was force-quit. So we call
 *    `registration.update()` at registration, on every return to the
 *    foreground (`visibilitychange`, `focus`, and `pageshow` — iOS standalone
 *    restores from the page cache and does not reliably fire the first two),
 *    and on a slow poll while the app is visible, for the case where the app
 *    is already open when the deploy lands.
 * 2. **The swap has to happen at a safe moment.** The poll is only safe because
 *    the reload waits for `isBusy()` to go false — a check that fires while a
 *    transaction is half-typed parks itself until the sheet closes.
 * 3. **The user has to understand the blink.** `registerType: 'prompt'` leaves
 *    `skipWaiting()` to us, so we paint the overlay first and reload second.
 *    It is not a question — there is no "later" — just an explanation of the
 *    second the screen is gone.
 */
export function ServiceWorkerUpdater() {
  const { t } = useTranslation()
  const registration = useRef<ServiceWorkerRegistration | undefined>(undefined)
  const [updating, setUpdating] = useState(false)

  const {
    needRefresh: [needRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_swUrl, r) {
      registration.current = r
    },
  })

  // 1. Ask whether there is a new build.
  useEffect(() => {
    function checkForUpdate() {
      if (document.visibilityState !== 'visible') return
      // Re-fetches sw.js. If it changed, the new worker installs and waits,
      // which is what flips `needRefresh` below.
      void registration.current?.update()
    }
    document.addEventListener('visibilitychange', checkForUpdate)
    window.addEventListener('focus', checkForUpdate)
    window.addEventListener('pageshow', checkForUpdate)
    const poll = setInterval(checkForUpdate, POLL_MS)
    return () => {
      document.removeEventListener('visibilitychange', checkForUpdate)
      window.removeEventListener('focus', checkForUpdate)
      window.removeEventListener('pageshow', checkForUpdate)
      clearInterval(poll)
    }
  }, [])

  // 2. There is one — wait until interrupting costs nothing, then show why.
  useEffect(() => {
    if (!needRefresh || updating) return
    let timer: ReturnType<typeof setTimeout>
    function attempt() {
      if (isBusy()) {
        timer = setTimeout(attempt, BUSY_RETRY_MS)
        return
      }
      setUpdating(true)
    }
    attempt()
    return () => clearTimeout(timer)
  }, [needRefresh, updating])

  // 3. Overlay is on screen — hand over. `updateServiceWorker` sends
  //    SKIP_WAITING; the reload comes from the resulting `controllerchange`.
  useEffect(() => {
    if (!updating) return
    // One frame's grace so the overlay is actually painted before the swap;
    // otherwise a fast takeover reloads through it and the blink is unexplained.
    const start = setTimeout(() => void updateServiceWorker(true), 400)
    // If the worker never takes over, reload by hand rather than leaving the
    // user on a dead overlay. Guarded: on the next load the worker would still
    // be waiting, and an unguarded fallback would reload forever.
    const giveUp = setTimeout(() => {
      if (sessionStorage.getItem(FALLBACK_KEY) === 'true') {
        setUpdating(false)
        return
      }
      sessionStorage.setItem(FALLBACK_KEY, 'true')
      window.location.reload()
    }, TAKEOVER_TIMEOUT_MS)
    return () => {
      clearTimeout(start)
      clearTimeout(giveUp)
    }
  }, [updating, updateServiceWorker])

  if (!updating) return null

  return (
    <div className="sw-update" role="status" aria-live="polite">
      <div className="text-title-s">{t('pwaUpdatingTitle')}</div>
      <div className="text-body-s sw-update__body">{t('pwaUpdatingBody')}</div>
      <div className="sw-update__track" aria-hidden="true">
        <div className="sw-update__bar" />
      </div>
    </div>
  )
}
