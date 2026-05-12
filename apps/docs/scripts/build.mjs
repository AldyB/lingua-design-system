/**
 * Docs build — copies static assets into dist/.
 * Phase 4 will replace this with a full Pages deploy workflow.
 */
import { readdirSync, copyFileSync, mkdirSync, statSync } from 'node:fs';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src  = resolve(__dirname, '..');
const dist = resolve(src, 'dist');

mkdirSync(dist, { recursive: true });

const STATIC_EXTS = new Set(['.html', '.css', '.js', '.jsx', '.svg', '.png', '.ico', '.json']);

const entries = readdirSync(src);
let copied = 0;
for (const entry of entries) {
  if (entry === 'dist' || entry === 'node_modules' || entry === 'scripts') continue;
  const stat = statSync(`${src}/${entry}`);
  if (stat.isFile() && STATIC_EXTS.has(extname(entry))) {
    copyFileSync(`${src}/${entry}`, `${dist}/${entry}`);
    copied++;
  }
}

console.log(`✓  @lingua/docs — copied ${copied} static file(s) to dist/`);
