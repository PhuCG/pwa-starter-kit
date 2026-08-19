import { AppIcon, Card, Dialog, EmptyState } from '@/components/ui'
import type { Note } from '@/domain/types'
import { useAppStore } from '@/store/appStore'
import { useNotes } from '@/store/selectors'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { NoteSheet } from './NoteSheet'

/**
 * The list screen. Delete this and build your own — what it demonstrates is the
 * four states every list route owes the user: **loading · empty · content ·
 * error**. Loading is handled upstream (`App` waits for hydration, the route is
 * behind `RouteSkeleton`), error is announced by the shell's write-error toast,
 * so what is left here is empty and content.
 */
export default function HomePage() {
  const { t, i18n } = useTranslation()
  const notes = useNotes()
  const userName = useAppStore((s) => s.profile.userName)
  const [editing, setEditing] = useState<Note | undefined>()
  const [pendingDelete, setPendingDelete] = useState<Note | undefined>()
  const removeNote = useAppStore((s) => s.removeNote)

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <div className="text-body-s" style={{ color: 'var(--color-text-sub)' }}>
            {t('homeGreeting', { name: userName })}
          </div>
          <div className="text-headline-s">{t('homeTitle')}</div>
        </div>
      </div>

      {notes.length === 0 ? (
        <EmptyState
          icon={<AppIcon name="note" size={28} color="var(--color-text-muted)" />}
          title={t('homeEmptyTitle')}
          subtitle={t('homeEmptySubtitle')}
        />
      ) : (
        <div style={{ display: 'grid', gap: 'var(--sp-md)' }}>
          {notes.map((note) => (
            <Card key={note.id} onClick={() => setEditing(note)}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--sp-sm)',
                  width: '100%',
                }}
              >
                {note.pinned ? <AppIcon name="pin" size={16} color="var(--color-primary)" /> : null}
                <div style={{ flex: 1, textAlign: 'left', minWidth: 0 }}>
                  <div className="text-title-s">{note.title}</div>
                  <div className="text-body-s" style={{ color: 'var(--color-text-sub)' }}>
                    {new Intl.DateTimeFormat(i18n.language, {
                      day: '2-digit',
                      month: 'short',
                    }).format(new Date(note.createdAt))}
                  </div>
                </div>
                <button
                  type="button"
                  aria-label={t('actionDelete')}
                  onClick={(e) => {
                    e.stopPropagation()
                    setPendingDelete(note)
                  }}
                >
                  <AppIcon name="delete" size={18} color="var(--color-text-muted)" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <NoteSheet
        open={editing !== undefined}
        onOpenChange={(open) => !open && setEditing(undefined)}
        editing={editing}
      />

      {/* Destructive actions always confirm — there is no undo and no backend
          copy to restore from. */}
      <Dialog
        open={pendingDelete !== undefined}
        title={t('noteDeleteTitle')}
        content={t('noteDeleteBody')}
        confirmLabel={t('actionDelete')}
        cancelLabel={t('actionCancel')}
        confirmDanger
        onConfirm={() => {
          if (pendingDelete) removeNote(pendingDelete.id)
          setPendingDelete(undefined)
        }}
        onCancel={() => setPendingDelete(undefined)}
      />
    </div>
  )
}
