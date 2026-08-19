import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'

/**
 * The catalog is a contract, and these are the four ways it silently rots.
 * This suite is deliberately mechanical — it is the reason nobody has to
 * remember rule 4 in CLAUDE.md.
 *
 * 1. A key used in code but missing from the catalog → the raw key ships.
 * 2. A key in the catalog that no code uses → dead copy nobody maintains.
 * 3. A locale that drifted from `en` → a screen that is half-translated.
 * 4. An emoji in the copy → see rule 1 in CLAUDE.md.
 */

const I18N_DIR = join(process.cwd(), 'i18n')
const SRC_DIR = join(process.cwd(), 'src')

/** Keys that only ever appear via a computed lookup, e.g. `t(\`nav.${id}\`)`. */
const DYNAMIC_KEYS: RegExp[] = [/^nav\./]

const EMOJI = /\p{Extended_Pictographic}/u

function catalog(locale: string): Record<string, string> {
  return JSON.parse(readFileSync(join(I18N_DIR, `${locale}.json`), 'utf8'))
}

function locales(): string[] {
  return readdirSync(I18N_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => f.replace(/\.json$/, ''))
}

function sourceFiles(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) return sourceFiles(full)
    if (!/\.tsx?$/.test(entry.name) || entry.name.endsWith('.test.ts')) return []
    if (entry.name.endsWith('.test.tsx')) return []
    return [full]
  })
}

function usedKeys(): Set<string> {
  const keys = new Set<string>()
  for (const file of sourceFiles(SRC_DIR)) {
    const text = readFileSync(file, 'utf8')
    for (const m of text.matchAll(/\bt\(\s*'([^']+)'/g)) keys.add(m[1] as string)
    for (const m of text.matchAll(/labelKey:\s*'([^']+)'/g)) keys.add(m[1] as string)
  }
  return keys
}

describe('i18n catalog', () => {
  const base = catalog('en')

  it('has every key the code asks for', () => {
    const missing = [...usedKeys()].filter((k) => !(k in base))
    expect(missing).toEqual([])
  })

  it('has no dead copy', () => {
    const used = usedKeys()
    const dead = Object.keys(base).filter(
      (k) => !used.has(k) && !DYNAMIC_KEYS.some((re) => re.test(k)),
    )
    expect(dead).toEqual([])
  })

  it.each(locales().filter((l) => l !== 'en'))('%s matches en key-for-key', (locale) => {
    const other = catalog(locale)
    expect(Object.keys(other).sort()).toEqual(Object.keys(base).sort())
  })

  it.each(locales())('%s carries no emoji', (locale) => {
    const offenders = Object.entries(catalog(locale))
      .filter(([, v]) => EMOJI.test(v))
      .map(([k]) => k)
    expect(offenders).toEqual([])
  })
})
