import { AppIcon, Button, Card, Dialog, useToast } from '@/components/ui'
import { readTextFile } from '@/db/backupIo'
import { type BackupError, backupScope, parseBackup } from '@/domain/backup'
import { useAppStore } from '@/store/appStore'
import type { TFunction } from 'i18next'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Export and restore — the only durable copy of the data (ADR 001).
 *
 * Two decisions worth keeping:
 *
 * - **The confirmation says what is in the file**, not just "everything will be
 *   replaced". `backupScope` gives a count and a date span, which is the
 *   difference between the user trusting the restore and guessing at it.
 * - **The file is chosen, then validated, then confirmed.** Confirming first
 *   would ask the user to accept a replacement by a file that turns out to be
 *   unreadable — and by then their own data is already gone.
 */
export function BackupCard() {
  const { t } = useTranslation()
  const toast = useToast()
  const exportBackup = useAppStore((s) => s.exportBackup)
  const restoreBackup = useAppStore((s) => s.restoreBackup)
  const noteCount = useAppStore((s) => s.notes.length)

  const fileInput = useRef<HTMLInputElement>(null)
  const [pending, setPending] = useState<{ raw: string; summary: string } | null>(null)

  async function onExport() {
    const outcome = await exportBackup()
    if (outcome === 'cancelled') return
    toast(t('backupExportDone'), 'success')
  }

  async function onFileChosen(file: File) {
    const raw = await readTextFile(file)
    // A dry-run parse: `restoreBackup` would return the same result, but it
    // would also have applied the file by then. The user has to be able to say
    // no to a file we have already read and found valid.
    const result = parseBackup(raw)
    if (!result.ok) {
      toast(errorMessage(t, result.reason), 'error')
      return
    }
    const scope = backupScope(result.backup.data)
    setPending({
      raw,
      summary:
        scope.noteCount === 0
          ? t('backupRestoreEmpty')
          : t('backupRestoreScope', {
              count: scope.noteCount,
              from: scope.firstDate,
              to: scope.lastDate,
            }),
    })
  }

  async function confirmRestore() {
    if (!pending) return
    const raw = pending.raw
    setPending(null)
    try {
      const result = await restoreBackup(raw)
      if (!result.ok) {
        toast(errorMessage(t, result.reason), 'error')
        return
      }
      toast(t('backupRestoreDone'), 'success')
    } catch {
      // `replaceAll` is the one awaited write in the app; if it rejects, disk
      // refused the swap and the old data is still there.
      toast(t('backupRestoreFailed'), 'error')
    }
  }

  return (
    <Card style={{ marginBottom: 'var(--sp-xl)' }}>
      <div className="text-title-s" style={{ marginBottom: 'var(--sp-xs)' }}>
        {t('backupTitle')}
      </div>
      <div
        className="text-body-s"
        style={{ color: 'var(--color-text-sub)', marginBottom: 'var(--sp-md)' }}
      >
        {t('backupBody', { count: noteCount })}
      </div>

      <div style={{ display: 'flex', gap: 'var(--sp-md)' }}>
        <Button variant="outlined" onClick={() => void onExport()}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-sm)' }}>
            <AppIcon name="download" size={18} />
            {t('backupExport')}
          </span>
        </Button>
        <Button variant="outlined" onClick={() => fileInput.current?.click()}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 'var(--sp-sm)' }}>
            <AppIcon name="upload" size={18} />
            {t('backupRestore')}
          </span>
        </Button>
      </div>

      <input
        ref={fileInput}
        type="file"
        accept="application/json,.json"
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0]
          // Cleared so choosing the same file twice in a row still fires.
          e.target.value = ''
          if (file) void onFileChosen(file)
        }}
      />

      <Dialog
        open={pending !== null}
        title={t('backupRestoreTitle')}
        content={
          <>
            {pending?.summary}
            <div style={{ marginTop: 'var(--sp-sm)', color: 'var(--color-error)' }}>
              {t('backupRestoreWarning')}
            </div>
          </>
        }
        confirmLabel={t('backupRestoreConfirm')}
        cancelLabel={t('actionCancel')}
        confirmDanger
        onConfirm={() => void confirmRestore()}
        onCancel={() => setPending(null)}
      />
    </Card>
  )
}

/**
 * One message per failure mode — a single "invalid file" tells the user nothing
 * about whether to look for another file or give up on this one.
 *
 * Takes `t` rather than returning a key so every key stays a literal inside a
 * `t('...')` call, which is what `src/lib/i18n.integrity.test.ts` scans for.
 */
function errorMessage(t: TFunction, reason: BackupError): string {
  switch (reason) {
    case 'invalid-json':
      return t('backupErrorInvalidJson')
    case 'not-a-backup':
      return t('backupErrorNotABackup')
    case 'unsupported-version':
      return t('backupErrorVersion')
    case 'corrupt-records':
      return t('backupErrorCorrupt')
  }
}
