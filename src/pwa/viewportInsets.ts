/**
 * Publishes where the visible part of the screen actually is, as two custom
 * properties on `<html>`.
 *
 * iOS never resizes the layout viewport for the keyboard. It shrinks the
 * *visual* viewport, and it will additionally shift that viewport down inside
 * the layout one to keep a focused field in sight. Everything positioned
 * against the layout viewport — our fixed shell, every bottom sheet — is blind
 * to both moves and ends up under the keys or off the top of the screen.
 * `interactive-widget=resizes-content` in the viewport meta handles this on
 * Chrome for Android and does nothing on iOS, so it has to be measured.
 *
 * - `--viewport-height`: how tall the visible area is. Size things to this
 *   rather than to `100dvh`, which keeps counting the covered part.
 * - `--viewport-bottom-inset`: how far the visible bottom edge sits above the
 *   layout viewport's bottom. This is what a `position: fixed` bottom anchor
 *   has to be lifted by.
 *
 * Both are consumed in `src/styles/global.css` and `src/components/ui/ui.css`;
 * nothing else should read them.
 */

/** Below this, a change is Safari's own toolbar sliding, not a keyboard. */
const NOISE_FLOOR = 24

export function trackViewportInsets(): void {
  const viewport = window.visualViewport
  if (!viewport) return

  const style = document.documentElement.style
  let frame = 0
  // -1 rather than the first reading, so the first pass always writes: the CSS
  // fallback is `100dvh`, which on iOS is the *small* viewport and can sit tens
  // of pixels away from what is actually visible with the toolbars out.
  let lastHeight = -1
  let lastInset = -1

  const apply = () => {
    frame = 0
    const height = Math.round(viewport.height)
    // What is left of the layout viewport below the visible area: the keyboard,
    // plus whatever Safari has scrolled past on its own. Below the floor it is
    // rounding, and a one-pixel lift on every sheet is not worth reacting to.
    const covered = Math.round(window.innerHeight - viewport.height - viewport.offsetTop)
    const inset = covered > NOISE_FLOOR ? covered : 0

    // Guarded because `scroll` fires every frame while the page moves under a
    // still viewport. Re-writing a custom property with the value it already
    // has still dirties style, which would relayout the whole shell per frame
    // for nothing.
    if (height !== lastHeight) style.setProperty('--viewport-height', `${height}px`)
    if (inset !== lastInset) style.setProperty('--viewport-bottom-inset', `${inset}px`)

    // Containers shrink only now, a beat after the browser has already scrolled
    // the field into what was then the visible area — so the field the user
    // tapped can end up back under the fold. Only while the area is closing in:
    // doing it on every reading would fight the user scrolling with a keyboard
    // up. The first pass has no previous reading and so is never a shrink.
    const shrank = lastHeight >= 0 && lastHeight - height > NOISE_FLOOR
    lastHeight = height
    lastInset = inset
    if (shrank) centreFocusedField()
  }

  // Both events fire every frame while the keyboard animates in; writing custom
  // properties that often would relayout the shell for each intermediate value,
  // so the last reading per frame wins.
  const schedule = () => {
    if (frame === 0) frame = requestAnimationFrame(apply)
  }

  viewport.addEventListener('resize', schedule)
  viewport.addEventListener('scroll', schedule)
  apply()
}

/**
 * Brings the field the user is typing in to the middle of whatever scrolls
 * around it.
 *
 * Deliberately not `scrollIntoView`: that walks every scrollable ancestor up to
 * and including the window, and scrolling the window is the one thing the fixed
 * shell exists to prevent — on iOS it drags a sheet's header off the top of the
 * screen. Only the nearest scroll container moves here.
 */
function centreFocusedField(): void {
  const element = document.activeElement
  // A shrinking viewport with nothing being typed into is a rotation or a
  // toolbar, and moving the page under the user then would be unasked for.
  if (!(element instanceof HTMLElement) || !isTextEntry(element)) return

  let scroller: HTMLElement | null = element.parentElement
  while (scroller) {
    const { overflowY } = getComputedStyle(scroller)
    if (overflowY === 'auto' || overflowY === 'scroll') break
    scroller = scroller.parentElement
  }
  if (!scroller) return

  const box = scroller.getBoundingClientRect()
  const target = element.getBoundingClientRect()
  scroller.scrollTop += target.top - box.top - (box.height - target.height) / 2
}

function isTextEntry(element: HTMLElement): boolean {
  const tag = element.tagName
  return tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || element.isContentEditable
}
