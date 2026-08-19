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
            // Card without `onClick`, with two sibling buttons inside.
            // `<Card onClick>` renders a <button>, and a second button nested in
            // it is invalid HTML — browsers disagree about which one a tap hits,
            // and a screen reader announces one control where there are two. A
            // row with its own secondary action gets two real targets rather
            // than a click swallowed by stopPropagation.
            <Card key={note.id}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--sp-sm)',
                  width: '100%',
                }}
              >
                <button
                  type="button"
                  onClick={() => setEditing(note)}
                  style={{
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--sp-sm)',
                    textAlign: 'left',
                    minWidth: 0,
                  }}
                >
                  {note.pinned ? (
                    <AppIcon name="pin" size={16} color="var(--color-primary)" />
                  ) : null}
                  <span style={{ minWidth: 0 }}>
                    <span className="text-title-s" style={{ display: 'block' }}>
                      {note.title}
                    </span>
                    <span
                      className="text-body-s"
                      style={{ display: 'block', color: 'var(--color-text-sub)' }}
                    >
                      {new Intl.DateTimeFormat(i18n.language, {
                        day: '2-digit',
                        month: 'short',
                      }).format(new Date(note.createdAt))}
                    </span>
                  </span>
                </button>
                <button
                  type="button"
                  aria-label={t('actionDelete')}
                  onClick={() => setPendingDelete(note)}
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
