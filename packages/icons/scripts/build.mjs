import { readdirSync, copyFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const src  = resolve(__dirname, '../src');
const dist = resolve(__dirname, '../dist');

mkdirSync(dist, { recursive: true });

const svgs = readdirSync(src).filter(f => f.endsWith('.svg'));
for (const file of svgs) {
  copyFileSync(`${src}/${file}`, `${dist}/${file}`);
}

console.log(`✓  @lingua/icons — copied ${svgs.length} SVG(s) to dist/`);
