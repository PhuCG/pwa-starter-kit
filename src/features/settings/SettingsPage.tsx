import { APP } from '@/app.config'
import { Card, SegmentedToggle } from '@/components/ui'
import { SUPPORTED_LOCALES } from '@/lib/i18n'
import { THEME_PREFERENCES } from '@/lib/theme'
import { InstallPrompt } from '@/pwa/InstallPrompt'
import { useAppStore } from '@/store/appStore'
import { useTranslation } from 'react-i18next'
import { BackupCard } from './BackupCard'

const LOCALE_LABELS: Record<string, string> = { vi: 'Tiếng Việt', en: 'English' }

/**
 * Settings. Also the honest place to surface durability: with no backend, an
 * evicted IndexedDB is permanent loss, so the user is told whether the browser
 * has promised to keep their data — and offered both mitigations that exist,
 * installing the app and exporting a backup.
 */
export default function SettingsPage() {
  const { t } = useTranslation()
  const locale = useAppStore((s) => s.locale)
  const setLocale = useAppStore((s) => s.setLocale)
  const theme = useAppStore((s) => s.theme)
  const setTheme = useAppStore((s) => s.setTheme)
  const persistence = useAppStore((s) => s.persistence)

  return (
    <div className="page">
      <div className="page-header">
        <div className="text-headline-s">{t('nav.settings')}</div>
      </div>

      <InstallPrompt />

      <Card style={{ marginBottom: 'var(--sp-xl)' }}>
        <div className="text-title-s" style={{ marginBottom: 'var(--sp-md)' }}>
          {t('settingsTheme')}
        </div>
        <SegmentedToggle
          value={theme}
          onChange={setTheme}
          options={THEME_PREFERENCES.map((p) => ({ value: p, label: t(`theme.${p}`) }))}
        />
      </Card>

      <Card style={{ marginBottom: 'var(--sp-xl)' }}>
        <div className="text-title-s" style={{ marginBottom: 'var(--sp-md)' }}>
          {t('settingsLanguage')}
        </div>
        <SegmentedToggle
          value={locale}
          onChange={setLocale}
          options={SUPPORTED_LOCALES.map((l) => ({ value: l, label: LOCALE_LABELS[l] ?? l }))}
        />
      </Card>

      <BackupCard />

      <Card style={{ marginBottom: 'var(--sp-xl)' }}>
        <div className="text-title-s" style={{ marginBottom: 'var(--sp-xs)' }}>
          {t('settingsStorageTitle')}
        </div>
        <div className="text-body-s" style={{ color: 'var(--color-text-sub)' }}>
          {persistence.persisted ? t('settingsStorageSafe') : t('settingsStorageAtRisk')}
        </div>
      </Card>

      <div
        className="text-body-s"
        style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}
      >
        {APP.name}
      </div>
    </div>
  )
}
