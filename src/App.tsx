import { APP } from '@/app.config'
import { AppIcon, Button, ToastProvider } from '@/components/ui'
import { ServiceWorkerUpdater } from '@/pwa/ServiceWorkerUpdater'
import { router } from '@/routes'
import { useAppStore } from '@/store/appStore'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { RouterProvider } from 'react-router/dom'

const CENTERED: React.CSSProperties = {
  minHeight: '100dvh',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'var(--color-background)',
  padding: 'var(--sp-xl)',
  textAlign: 'center',
}

/**
 * Owns the three startup states and nothing else. Routing, toasts and the
 * service-worker updater only mount once the data is actually in memory, so no
 * screen has to defend against a half-loaded store.
 */
export default function App() {
  const hydrateStatus = useAppStore((s) => s.hydrateStatus)
  const hydrate = useAppStore((s) => s.hydrate)

  useEffect(() => {
    void hydrate()
  }, [hydrate])

  if (hydrateStatus === 'error') return <StartupError onRetry={() => void hydrate()} />

  if (hydrateStatus !== 'ready') {
    return (
      <div style={CENTERED}>
        <div className="ui-gradient-text text-headline-s" style={{ fontWeight: 800 }}>
          {APP.name}
        </div>
      </div>
    )
  }

  return (
    <ToastProvider>
      <RouterProvider router={router} />
      <ServiceWorkerUpdater />
    </ToastProvider>
  )
}

/**
 * Shown when the database will not open — a corrupt store, a browser that
 * blocks IndexedDB, or Safari private mode. Retrying is worth offering because
 * the common causes are transient, and a dead end here reads as "the app lost
 * everything" when the data is usually still on disk.
 */
function StartupError({ onRetry }: { onRetry: () => void }) {
  const { t } = useTranslation()
  return (
    <div style={CENTERED} role="alert">
      <span
        className="ui-icon-box ui-icon-box--circle"
        style={{ background: 'var(--chart-4-light)', color: 'var(--color-warning)' }}
      >
        <AppIcon name="alert" size={22} />
      </span>
      <div className="text-title-l" style={{ marginTop: 'var(--sp-lg)' }}>
        {t('startupErrorTitle')}
      </div>
      <div
        className="text-body-m"
        style={{ color: 'var(--color-text-sub)', marginTop: 'var(--sp-sm)', maxWidth: 320 }}
      >
        {t('startupErrorBody')}
      </div>
      <div style={{ marginTop: 'var(--sp-xl)', width: '100%', maxWidth: 320 }}>
        <Button onClick={onRetry}>{t('startupErrorRetry')}</Button>
      </div>
    </div>
  )
}
