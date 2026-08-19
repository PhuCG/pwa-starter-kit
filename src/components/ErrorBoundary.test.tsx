import { fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'

function Boom({ explode }: { explode: boolean }): React.ReactElement {
  if (explode) throw new Error('kaboom')
  return <div>fine</div>
}

beforeEach(() => {
  // React logs the caught error itself; silence it so a passing run is quiet.
  vi.spyOn(console, 'error').mockImplementation(() => {})
})
afterEach(() => vi.restoreAllMocks())

describe('ErrorBoundary', () => {
  it('renders children when nothing throws', () => {
    render(
      <ErrorBoundary fallback={() => <div>crashed</div>}>
        <Boom explode={false} />
      </ErrorBoundary>,
    )
    expect(screen.getByText('fine')).toBeTruthy()
  })

  it('shows the fallback instead of unmounting the tree', () => {
    render(
      <ErrorBoundary fallback={() => <div>crashed</div>}>
        <Boom explode={true} />
      </ErrorBoundary>,
    )
    expect(screen.getByText('crashed')).toBeTruthy()
  })

  it('reports the error to onError', () => {
    const onError = vi.fn()
    render(
      <ErrorBoundary fallback={() => <div>crashed</div>} onError={onError}>
        <Boom explode={true} />
      </ErrorBoundary>,
    )
    expect(onError).toHaveBeenCalledOnce()
    expect(onError.mock.calls[0]?.[0]).toBeInstanceOf(Error)
  })

  it('clears itself when resetKey changes, so navigating away recovers', () => {
    function Harness() {
      const [route, setRoute] = useState('/a')
      return (
        <>
          <button type="button" onClick={() => setRoute('/b')}>
            navigate
          </button>
          <ErrorBoundary resetKey={route} fallback={() => <div>crashed</div>}>
            <Boom explode={route === '/a'} />
          </ErrorBoundary>
        </>
      )
    }
    render(<Harness />)
    expect(screen.getByText('crashed')).toBeTruthy()

    // fireEvent, not node.click(): the raw DOM call is not wrapped in act, so
    // React never flushes the state update it triggers.
    fireEvent.click(screen.getByText('navigate'))
    expect(screen.getByText('fine')).toBeTruthy()
  })

  it('keeps showing the fallback while resetKey is unchanged', () => {
    const { rerender } = render(
      <ErrorBoundary resetKey="/a" fallback={() => <div>crashed</div>}>
        <Boom explode={true} />
      </ErrorBoundary>,
    )
    rerender(
      <ErrorBoundary resetKey="/a" fallback={() => <div>crashed</div>}>
        <Boom explode={false} />
      </ErrorBoundary>,
    )
    expect(screen.getByText('crashed')).toBeTruthy()
  })
})
