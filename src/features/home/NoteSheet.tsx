import { Button, DateField, Sheet } from '@/components/ui'
import { isNonBlank } from '@/domain/constraints'
import { dateToDayKey } from '@/domain/dates'
import type { Note } from '@/domain/types'
import { useAppStore } from '@/store/appStore'
import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

/**
 * Create/edit form — the worked example of the form contract:
 *
 * - **The UI validates the same rules `src/domain/constraints.ts` asserts**, but
 *   with a friendly message and *before* submitting. The assert in the store is
 *   the backstop that catches programming errors, never the user's typo.
 * - State is local until Save. Nothing half-typed reaches the store.
 * - The primary action lives in the sheet `footer`, so a long form never hides
 *   its own Save button.
 */
export function NoteSheet({
  open,
  onOpenChange,
  editing,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Present = edit an existing record; absent = create a new one. */
  editing?: Note
}) {
  const { t } = useTranslation()
  const addNote = useAppStore((s) => s.addNote)
  const updateNote = useAppStore((s) => s.updateNote)

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [date, setDate] = useState(() => dateToDayKey(new Date()))
  const [touched, setTouched] = useState(false)

  // Reset on every open so a cancelled edit does not leak into the next one.
  useEffect(() => {
    if (!open) return
    setTitle(editing?.title ?? '')
    setBody(editing?.body ?? '')
    setDate(editing?.date ?? dateToDayKey(new Date()))
    setTouched(false)
  }, [open, editing])

  const titleError = touched && !isNonBlank(title) ? t('noteTitleRequired') : null

  function save() {
    setTouched(true)
    if (!isNonBlank(title)) return
    if (editing) updateNote(editing.id, { title, body, date })
    else addNote({ title, body, date })
    onOpenChange(false)
  }

  return (
    <Sheet
      open={open}
      onOpenChange={onOpenChange}
      ariaTitle={editing ? t('noteEditTitle') : t('noteAddTitle')}
      footer={
        <Button variant="gradient" onClick={save}>
          {t('actionSave')}
        </Button>
      }
    >
      <div className="text-title-l" style={{ marginBottom: 'var(--sp-xl)' }}>
        {editing ? t('noteEditTitle') : t('noteAddTitle')}
      </div>

      <label className="text-label-m" htmlFor="note-title">
        {t('noteTitleLabel')}
      </label>
      <input
        id="note-title"
        className="ui-input"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onBlur={() => setTouched(true)}
        placeholder={t('noteTitlePlaceholder')}
        style={{ marginTop: 'var(--sp-xs)' }}
      />
      {titleError ? (
        <div
          className="text-body-s"
          style={{ color: 'var(--color-error)', marginTop: 'var(--sp-xs)' }}
        >
          {titleError}
        </div>
      ) : null}

      <label
        className="text-label-m"
        htmlFor="note-body"
        style={{ display: 'block', marginTop: 'var(--sp-lg)' }}
      >
        {t('noteBodyLabel')}
      </label>
      <textarea
        id="note-body"
        className="ui-input"
        value={body}
        onChange={(e) => setBody(e.target.value)}
        rows={4}
        style={{ marginTop: 'var(--sp-xs)', resize: 'none' }}
      />

      <div className="text-label-m" style={{ marginTop: 'var(--sp-lg)' }}>
        {t('noteDateLabel')}
      </div>
      <div style={{ marginTop: 'var(--sp-xs)' }}>
        <DateField value={date} onChange={setDate} ariaLabel={t('noteDateLabel')} />
      </div>
    </Sheet>
  )
}
