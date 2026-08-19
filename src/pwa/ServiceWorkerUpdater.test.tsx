import { initI18n } from '@/lib/i18n'
import { act, render, screen } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'

/**
 * The reload is the one thing in the app that can destroy work the user has not
 * saved, so what is pinned here is *when* it is allowed to happen: never while a
 * sheet is open or a field is focused, and never without the overlay on screen
 * first. `virtual:pwa-register/react` is mocked (it only exists inside a Vite
 * build) — the mock is the seam that lets a test say "a new build just landed".
 */

const updateServiceWorker = vi.fn(() => Promise.resolve())
let needRefresh = false

vi.mock('virtual:pwa-register/react', () => ({
  useRegisterSW: () => ({
    needRefresh: [needRefresh, vi.fn()],
    offlineReady: [false, vi.fn()],
    updateServiceWorker,
  }),
}))

const { ServiceWorkerUpdater } = await import('./ServiceWorkerUpdater')

beforeAll(async () => {
  await initI18n('vi')
})

beforeEach(() => {
  vi.useFakeTimers()
  needRefresh = false
  updateServiceWorker.mockClear()
  document.body.removeAttribute('data-scroll-locked')
})

afterEach(() => {
  vi.useRealTimers()
})

describe('ServiceWorkerUpdater', () => {
  it('stays invisible while the app is on the latest build', () => {
    render(<ServiceWorkerUpdater />)
    expect(screen.queryByRole('status')).toBeNull()
    expect(updateServiceWorker).not.toHaveBeenCalled()
  })

  it('explains itself before handing over to the new build', async () => {
    needRefresh = true
    render(<ServiceWorkerUpdater />)

    // Overlay first — the takeover is deliberately a beat behind it.
    expect(screen.getByRole('status')).toBeTruthy()
    expect(updateServiceWorker).not.toHaveBeenCalled()

    await act(async () => {
      vi.advanceTimersByTime(500)
    })
    expect(updateServiceWorker).toHaveBeenCalledWith(true)
  })

  it('waits for an open sheet to close instead of reloading through it', async () => {
    needRefresh = true
    document.body.setAttribute('data-scroll-locked', '')
    render(<ServiceWorkerUpdater />)

    expect(screen.queryByRole('status')).toBeNull()

    await act(async () => {
      vi.advanceTimersByTime(5_000)
    })
    expect(screen.queryByRole('status')).toBeNull()
    expect(updateServiceWorker).not.toHaveBeenCalled()

    document.body.removeAttribute('data-scroll-locked')
    await act(async () => {
      vi.advanceTimersByTime(1_500)
    })
    expect(screen.getByRole('status')).toBeTruthy()
  })

  it('waits while a field is focused', async () => {
    needRefresh = true
    const input = document.createElement('input')
    document.body.appendChild(input)
    input.focus()
    render(<ServiceWorkerUpdater />)

    await act(async () => {
      vi.advanceTimersByTime(5_000)
    })
    expect(screen.queryByRole('status')).toBeNull()

    input.blur()
    input.remove()
    await act(async () => {
      vi.advanceTimersByTime(1_500)
    })
    expect(screen.getByRole('status')).toBeTruthy()
  })
})
