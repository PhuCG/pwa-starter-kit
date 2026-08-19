/** Prefixed unique ids. UUID rather than epoch-millis: two records created in
 * the same millisecond are common (a bulk import, a double tap) and an id
 * collision is silent data loss. */
export function newId(prefix: string): string {
  const uuid =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}_${Math.random().toString(36).slice(2, 10)}`
  return `${prefix}_${uuid}`
}

export const noteId = () => newId('note')
