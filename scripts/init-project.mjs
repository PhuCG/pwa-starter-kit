#!/usr/bin/env node
/**
 * Turn the starter into a named project.
 *
 * Product identity is deliberately duplicated in five places the browser reads
 * at different moments — `src/app.config.ts` (the source of truth),
 * `index.html` (before any JS runs), `src/styles/tokens.css` (before any JS
 * runs), `package.json` and `.claude/launch.json`. Keeping them in sync by
 * hand is exactly the kind of thing that is wrong for six months, so this
 * script is the only supported way to change them.
 *
 *   node scripts/init-project.mjs                      # interactive
 *   node scripts/init-project.mjs --name "Habit Log" --slug habit-log \
 *        --short Habits --color "#0ea5e9" --locale en --description "..." --yes
 *   node scripts/init-project.mjs ... --fresh-git      # also reset git history
 *
 * Run it once, right after cloning. Running it twice is harmless — it rewrites
 * whatever the current values are.
 */
import { execFileSync } from 'node:child_process'
import { existsSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { createInterface } from 'node:readline/promises'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const HEX = /^#[0-9a-fA-F]{6}$/

// ── Arguments ────────────────────────────────────────────────────────────────

function parseArgs(argv) {
  const out = {}
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i]
    if (!arg.startsWith('--')) continue
    const key = arg.slice(2)
    if (key === 'yes' || key === 'fresh-git') out[key] = true
    else out[key] = argv[++i]
  }
  return out
}

const args = parseArgs(process.argv.slice(2))

/** `Sổ Thói Quen` → `so-thoi-quen`; the package name and the URL-ish identity. */
const toSlug = (s) =>
  s
    // Đ/đ is a distinct letter, not D plus a diacritic, so NFD leaves it alone
    // and it would be dropped entirely by the ASCII filter below.
    .replace(/Đ/g, 'D')
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

/** `habit-log` → `habit_log`; the IndexedDB name and storage-key prefix. */
const toSnake = (s) => toSlug(s).replace(/-/g, '_')

async function collect() {
  if (args.yes || args.name) {
    const name = args.name ?? 'My App'
    const slug = args.slug ?? toSlug(name)
    return {
      name,
      slug,
      shortName: args.short ?? name.split(' ')[0],
      description: args.description ?? name,
      color: args.color ?? '#4f46e5',
      locale: args.locale ?? 'vi',
    }
  }

  const rl = createInterface({ input: process.stdin, output: process.stdout })
  const ask = async (question, fallback) => {
    const answer = (await rl.question(`${question} [${fallback}]: `)).trim()
    return answer === '' ? fallback : answer
  }

  const name = await ask('Product name', 'My App')
  const slug = await ask('Slug (package name, database name)', toSlug(name))
  const shortName = await ask('Home-screen label (<= 12 chars)', name.split(' ')[0])
  const description = await ask('One-line description', name)
  const color = await ask('Primary colour (#rrggbb)', '#4f46e5')
  const locale = await ask('Default locale', 'vi')
  rl.close()
  return { name, slug, shortName, description, color, locale }
}

// ── Rewriting ────────────────────────────────────────────────────────────────

/**
 * Replace by regex, and fail loudly when a pattern stops matching. A silent
 * no-op here would leave the app half-renamed, which is worse than a crash:
 * the mismatch only shows up as a stale name on someone's home screen.
 */
function rewrite(relPath, edits) {
  const path = join(ROOT, relPath)
  if (!existsSync(path)) {
    console.warn(`  skip  ${relPath} (not found)`)
    return
  }
  let text = readFileSync(path, 'utf8')
  for (const [pattern, replacement] of edits) {
    if (!pattern.test(text)) {
      throw new Error(`${relPath}: pattern no longer matches: ${pattern}`)
    }
    text = text.replace(pattern, replacement)
  }
  writeFileSync(path, text)
  console.log(`  wrote ${relPath}`)
}

function apply(cfg) {
  const snake = toSnake(cfg.slug)
  const esc = (s) => s.replace(/'/g, "\\'")

  rewrite('src/app.config.ts', [
    [/name: '[^']*'/, `name: '${esc(cfg.name)}'`],
    [/shortName: '[^']*'/, `shortName: '${esc(cfg.shortName)}'`],
    [/description: '[^']*'/, `description: '${esc(cfg.description)}'`],
    [/themeColor: '#[0-9a-fA-F]{6}'/, `themeColor: '${cfg.color}'`],
    [/storagePrefix: '[^']*'/, `storagePrefix: '${snake}_v1'`],
    [/dbName: '[^']*'/, `dbName: '${snake}'`],
    [/defaultLocale: '[^']*'/, `defaultLocale: '${cfg.locale}'`],
  ])

  rewrite('package.json', [[/"name": "[^"]*"/, `"name": "${cfg.slug}"`]])

  rewrite('index.html', [
    [/<html lang="[^"]*">/, `<html lang="${cfg.locale}">`],
    [
      /<meta name="theme-color" content="[^"]*" \/>/,
      `<meta name="theme-color" content="${cfg.color}" />`,
    ],
    [
      /<meta name="apple-mobile-web-app-title" content="[^"]*" \/>/,
      `<meta name="apple-mobile-web-app-title" content="${cfg.shortName}" />`,
    ],
    [/<title>[^<]*<\/title>/, `<title>${cfg.name}</title>`],
  ])

  rewrite('src/styles/tokens.css', [
    [/--color-primary: #[0-9a-fA-F]{6};/, `--color-primary: ${cfg.color};`],
  ])

  rewrite('.claude/launch.json', [
    [/"name": "[a-z0-9-]+-dev"/, `"name": "${cfg.slug}-dev"`],
    [/"name": "[a-z0-9-]+-preview"/, `"name": "${cfg.slug}-preview"`],
  ])

  rewrite('README.md', [[/^# .*$/m, `# ${cfg.name}`]])
}

function freshGit() {
  rmSync(join(ROOT, '.git'), { recursive: true, force: true })
  execFileSync('git', ['init', '-q', '-b', 'main'], { cwd: ROOT })
  console.log('  reset git history (nothing committed yet)')
}

// ── Main ─────────────────────────────────────────────────────────────────────

const cfg = await collect()

if (!HEX.test(cfg.color)) {
  console.error(`Primary colour must be #rrggbb, got "${cfg.color}"`)
  process.exit(1)
}
if (cfg.slug === '') {
  console.error('Slug cannot be empty')
  process.exit(1)
}

console.log(`\nSetting up "${cfg.name}" (${cfg.slug}):`)
apply(cfg)
if (args['fresh-git']) freshGit()

console.log(`
Done. Next:

  1. Replace the icons in public/ (pwa-*.png, maskable-icon-512x512.png,
     apple-touch-icon-180x180.png, favicon.ico) — they are still the starter's.
  2. Open src/styles/tokens.css and set the rest of the palette. --color-primary
     is done; --color-secondary and --gradient-primary are not.
  3. Replace the Note example: src/domain/types.ts, src/db/db.ts, src/db/repo.ts,
     the notes slice of src/store/appStore.ts, and src/features/home/.
  4. Rewrite CLAUDE.md's "Domain modules" table and the placeholders in .docs/.
  5. npm run check
`)
