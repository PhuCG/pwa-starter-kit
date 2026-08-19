import { AppIcon, useToast } from '@/components/ui'
import { NoteSheet } from '@/features/home/NoteSheet'
import { useAppStore } from '@/store/appStore'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NavLink, Outlet } from 'react-router'
import './shell.css'

/**
 * The persistent chrome: bottom nav, the primary create action, and the one
 * place app-wide feedback is announced from.
 *
 * Tabs are data, not markup — adding one is a row here, and the layout adapts
 * because `.shell-tab` is `flex: 1`. Keep it to five at most: past that the hit
 * targets fall below 44px on a small phone.
 */
const TABS = [
  { to: '/', icon: 'home', labelKey: 'nav.home' },
  { to: '/settings', icon: 'settings', labelKey: 'nav.settings' },
] as const

export function Shell() {
  const { t } = useTranslation()
  const [createOpen, setCreateOpen] = useState(false)
  useWriteErrorToast()

  return (
    <>
      <Outlet />
      <nav className="shell-nav">
        <div className="shell-nav__inner">
          <TabLink {...TABS[0]} label={t(TABS[0].labelKey)} />
          <button
            type="button"
            className="shell-fab"
            onClick={() => setCreateOpen(true)}
            aria-label={t('noteAddTitle')}
          >
            <AppIcon name="plus" size={26} color="var(--color-on-accent)" strokeWidth={2.2} />
          </button>
          <TabLink {...TABS[1]} label={t(TABS[1].labelKey)} />
        </div>
      </nav>
      <NoteSheet open={createOpen} onOpenChange={setCreateOpen} />
    </>
  )
}

/**
 * A write that never reached disk still shows in the UI, so the user has no way
 * to tell it was lost until they reload. Announce it from the shell, which is
 * mounted on every tab — a per-page listener would miss failures that land
 * after a navigation.
 */
function useWriteErrorToast(): void {
  const { t } = useTranslation()
  const toast = useToast()
  const lastWriteError = useAppStore((s) => s.lastWriteError)
  const dismissWriteError = useAppStore((s) => s.dismissWriteError)

  useEffect(() => {
    if (!lastWriteError) return
    toast(t('storageWriteFailedToast'), 'error')
    dismissWriteError()
  }, [lastWriteError, dismissWriteError, toast, t])
}

function TabLink({ to, icon, label }: { to: string; icon: string; label: string }) {
  return (
    <NavLink to={to} end={to === '/'} className="shell-tab">
      {({ isActive }) => (
        <>
          <AppIcon
            name={icon}
            size={22}
            color={isActive ? 'var(--color-primary)' : 'var(--color-text-muted)'}
            strokeWidth={isActive ? 2.2 : 1.8}
          />
          <span
            className="text-label-s"
            style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-text-muted)' }}
          >
            {label}
          </span>
        </>
      )}
    </NavLink>
  )
}
