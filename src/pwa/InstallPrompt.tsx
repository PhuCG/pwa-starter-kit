import { storageKey } from '@/app.config'
import { Button, Card } from '@/components/ui'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

interface BeforeInstallPromptEvent extends Event {
  prompt(): Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = storageKey('install_prompt_dismissed')

function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // biome-ignore lint/suspicious/noExplicitAny: iOS Safari non-standard flag
    (navigator as any).standalone === true
  )
}

function isIOS(): boolean {
  return /iphone|ipad|ipod/i.test(navigator.userAgent)
}

/**
 * Install card for the Settings page: captures `beforeinstallprompt` on
 * Android/desktop, and shows Add-to-Home-Screen instructions on iOS, which
 * fires no such event and where installing is also what buys the app its
 * storage-eviction exemption (see `src/db/persistence.ts`).
 */
export function InstallPrompt() {
  const { t } = useTranslation()
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(null)
  const [dismissed, setDismissed] = useState(
    () => localStorage.getItem(DISMISS_KEY) === 'true' || isStandalone(),
  )

  useEffect(() => {
    const handler = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BeforeInstallPromptEvent)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  if (dismissed) return null
  const ios = isIOS()
  if (!deferred && !ios) return null

  function dismiss() {
    localStorage.setItem(DISMISS_KEY, 'true')
    setDismissed(true)
  }

  return (
    <Card elevated style={{ marginBottom: 'var(--sp-xl)' }}>
      <div className="text-title-s" style={{ marginBottom: 'var(--sp-xs)' }}>
        {t('pwaInstallTitle')}
      </div>
      <div
        className="text-body-s"
        style={{ color: 'var(--color-text-sub)', marginBottom: 'var(--sp-md)' }}
      >
        {ios ? t('pwaInstallBodyIos') : t('pwaInstallBodyAndroid')}
      </div>
      <div style={{ display: 'flex', gap: 'var(--sp-md)' }}>
        {!ios && deferred ? (
          <Button
            variant="gradient"
            onClick={() => {
              void deferred.prompt().then(() => dismiss())
            }}
          >
            {t('pwaInstallConfirm')}
          </Button>
        ) : null}
        <Button variant="ghost" onClick={dismiss}>
          {t('pwaInstallLater')}
        </Button>
      </div>
    </Card>
  )
}
