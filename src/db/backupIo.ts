/**
 * Browser plumbing for backup files. Kept apart from `src/domain/backup.ts` so
 * the format and its validation stay pure and testable; there is nothing here
 * but Blob, share, anchor and FileReader wiring.
 */

export type SaveOutcome = 'shared' | 'downloaded' | 'cancelled'

/**
 * Hands the backup to the OS by whatever route that OS actually has.
 *
 * On iOS a home-screen PWA has no download UI at all — Safari's download
 * machinery is not part of the standalone shell, so `<a download>` clicks into
 * the void and the user is left with no way to get their only copy of the data
 * off the device. The share sheet is the route that exists there, and "Save to
 * Files" in it is a real file in a place the user chose.
 *
 * Everywhere else a download is the better answer: it is one gesture instead of
 * two and it lands in a known folder, so the share path is not taken.
 *
 * Must be called straight out of a user gesture — `navigator.share` rejects
 * otherwise, and nothing here awaits before reaching it.
 */
export async function saveBackupFile(fileName: string, json: string): Promise<SaveOutcome> {
  const file = new File([json], fileName, { type: 'application/json' })

  if (isIOS() && navigator.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file] })
      return 'shared'
    } catch (error) {
      // Backing out of the share sheet is a decision, not a failure.
      if (error instanceof DOMException && error.name === 'AbortError') return 'cancelled'
      // Anything else means share was advertised but would not run. A download
      // probably fails too on this platform, but an attempt beats nothing.
    }
  }

  downloadJson(fileName, json)
  return 'downloaded'
}

function downloadJson(fileName: string, json: string): void {
  const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
  const a = document.createElement('a')
  a.href = url
  a.download = fileName
  a.rel = 'noopener'
  document.body.appendChild(a)
  a.click()
  a.remove()
  // Revoking synchronously can cancel the download in Safari.
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

/**
 * A platform check, deliberately: this is a platform bug, not a missing
 * feature. `canShare` alone would route desktop Safari through a share sheet it
 * does not need, and no feature detection reports "downloads silently do
 * nothing here" — the anchor reports success either way.
 */
function isIOS(): boolean {
  const { platform, maxTouchPoints } = navigator
  // iPadOS claims to be a Mac; touch points are what give it away.
  return /iPad|iPhone|iPod/.test(platform) || (platform === 'MacIntel' && maxTouchPoints > 1)
}

export function readTextFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result ?? ''))
    reader.onerror = () => reject(reader.error ?? new Error('file read failed'))
    reader.readAsText(file)
  })
}
