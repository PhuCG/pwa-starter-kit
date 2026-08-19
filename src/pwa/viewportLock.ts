/**
 * Refuses the zoom gestures that CSS cannot turn off.
 *
 * The rest of the lock is declarative — `touch-action` plus the fixed shell in
 * `src/styles/global.css`, and `user-scalable=no` in `index.html`. That is
 * enough for Chrome, but not for the browser that matters most here: iOS
 * Safari ignores `user-scalable=no` and still zooms a pinch that starts on the
 * page, and it is where the app gets installed to the Home Screen. Its
 * non-standard `gesture*` events are the only hook to say no, so they are
 * cancelled here.
 *
 * Deliberately touch-only. Desktop browser zoom (ctrl+wheel, ctrl+plus) is a
 * user's accessibility control over a window, not a stray gesture, and stays.
 */
export function lockViewport(): void {
  const refuse = (event: Event) => event.preventDefault()

  // Safari-only; a no-op everywhere else.
  for (const type of ['gesturestart', 'gesturechange', 'gestureend']) {
    document.addEventListener(type, refuse, { passive: false })
  }

  // A second finger is never a scroll in this app. Cancelling the move covers
  // the pinch Safari starts without ever firing `gesturestart` — which happens
  // when the two fingers land on different elements.
  document.addEventListener(
    'touchmove',
    (event) => {
      if (event.touches.length > 1) event.preventDefault()
    },
    { passive: false },
  )
}
