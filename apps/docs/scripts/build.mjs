/**
 * Docs build — assembles the static site into dist/.
 * Phase 4 will swap this for a full Pages deploy workflow.
 *
 * Build order (enforced by Turborepo dependsOn):
 *   @lingua/tokens → @lingua/icons → @lingua/docs
 */
import { readdirSync, copyFileSync, mkdirSync, statSync, existsSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const SRC  = resolve(__dirname, '..');
const DIST = resolve(SRC, 'dist');
const TOKENS_DIST = resolve(SRC, '../../packages/tokens/dist');
const ICONS_DIST  = resolve(SRC, '../../packages/icons/dist');

mkdirSync(DIST, { recursive: true });

// ── 1. Copy token CSS (from @lingua/tokens) ──────────────────────────────────
const TOKEN_CSS = ['lingua.light.css', 'lingua.dark.css'];
for (const f of TOKEN_CSS) {
  const src = resolve(TOKENS_DIST, 'css', f);
  if (existsSync(src)) {
    copyFileSync(src, resolve(DIST, f));
  } else {
    console.warn(`⚠  Token CSS not found: ${src} — run pnpm tokens:build first`);
  }
}

// ── 2. Copy brand SVGs (from @lingua/icons) ───────────────────────────────────
if (existsSync(ICONS_DIST)) {
  for (const svg of readdirSync(ICONS_DIST).filter(f => f.endsWith('.svg'))) {
    copyFileSync(resolve(ICONS_DIST, svg), resolve(DIST, svg));
  }
}

// ── 3. Copy all static docs files ─────────────────────────────────────────────
const STATIC_EXTS = new Set(['.html', '.css', '.js', '.jsx', '.svg', '.png', '.ico', '.json']);
for (const entry of readdirSync(SRC)) {
  if (entry === 'dist' || entry === 'node_modules' || entry === 'scripts') continue;
  const stat = statSync(resolve(SRC, entry));
  if (stat.isFile() && STATIC_EXTS.has(extname(entry))) {
    copyFileSync(resolve(SRC, entry), resolve(DIST, entry));
  }
}

const tokenCssCount = TOKEN_CSS.filter(f => existsSync(resolve(DIST, f))).length;
console.log(`✓  @lingua/docs — built (${tokenCssCount} token CSS, icons, static files → dist/)`);
