import { AppIcon, Button } from '@/components/ui'
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Catches a render crash so one broken screen does not take the whole app to a
 * white page — which, in an installed PWA with no address bar, the user cannot
 * even reload out of.
 *
 * Two things this deliberately does NOT do:
 *
 * - **It does not report anywhere.** There is no backend (ADR 001). `onError`
 *   is the hook to add one later; today it only reaches the console.
 * - **It does not catch async errors**, event handlers, or rejected promises —
 *   React error boundaries never have. Failures on the write path are handled
 *   separately by the store's `lastWriteError` toast.
 *
 * `resetKey` is what makes a route-level boundary usable: change it (the app
 * passes the pathname) and the boundary clears itself, so navigating away from
 * a crashed screen recovers without a reload.
 */
interface Props {
  children: ReactNode
  /** Changing this value clears a caught error. Pass the route path. */
  resetKey?: string
  /** Rendered instead of the default screen. Receives the retry callback. */
  fallback?: (retry: () => void) => ReactNode
  onError?: (error: Error, info: ErrorInfo) => void
}

interface State {
  error: Error | null
  /** The `resetKey` in force when the error was caught. */
  caughtAt: string | undefined
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null, caughtAt: undefined }

  static getDerivedStateFromError(error: Error): Partial<State> {
    return { error }
  }

  /**
   * Compared in render rather than in an effect: an effect would paint the
   * stale error screen for a frame after the route already changed.
   */
  static getDerivedStateFromProps(props: Props, state: State): Partial<State> | null {
    if (state.error && state.caughtAt !== undefined && state.caughtAt !== props.resetKey) {
      return { error: null, caughtAt: undefined }
    }
    return null
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    this.setState({ caughtAt: this.props.resetKey })
    this.props.onError?.(error, info)
    console.error('Render crashed:', error, info.componentStack)
  }

  retry = (): void => {
    this.setState({ error: null, caughtAt: undefined })
  }

  render(): ReactNode {
    const { error } = this.state
    if (!error) return this.props.children
    if (this.props.fallback) return this.props.fallback(this.retry)
    return <CrashScreen error={error} onRetry={this.retry} />
  }
}

/**
 * Function component so it can use `useTranslation` — a class cannot, and a
 * crash screen in the wrong language is its own small failure.
 */
function CrashScreen({ error, onRetry }: { error: Error; onRetry: () => void }) {
  const { t } = useTranslation()
  return (
    <div className="page page--stack" role="alert" style={{ textAlign: 'center' }}>
      <span
        className="ui-icon-box ui-icon-box--circle"
        style={{
          background: 'var(--chart-4-light)',
          color: 'var(--color-warning)',
          margin: '0 auto',
        }}
      >
        <AppIcon name="alert" size={22} />
      </span>
      <div className="text-title-l" style={{ marginTop: 'var(--sp-lg)' }}>
        {t('crashTitle')}
      </div>
      <div
        className="text-body-m"
        style={{
          color: 'var(--color-text-sub)',
          marginTop: 'var(--sp-sm)',
          maxWidth: 320,
          marginInline: 'auto',
        }}
      >
        {t('crashBody')}
      </div>
      {/* The message, not the stack. It is the part a user can actually relay,
          and a stack trace on screen reads as "the app is broken beyond use". */}
      <div
        className="text-body-s"
        style={{
          marginTop: 'var(--sp-lg)',
          padding: 'var(--sp-md)',
          background: 'var(--color-surface-variant)',
          borderRadius: 'var(--radius-md)',
          color: 'var(--color-text-muted)',
          wordBreak: 'break-word',
        }}
      >
        {error.message}
      </div>
      <div style={{ marginTop: 'var(--sp-xl)', display: 'grid', gap: 'var(--sp-md)' }}>
        <Button onClick={onRetry}>{t('crashRetry')}</Button>
        <Button variant="ghost" onClick={() => window.location.reload()}>
          {t('crashReload')}
        </Button>
      </div>
    </div>
  )
}
