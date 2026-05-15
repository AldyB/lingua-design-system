/**
 * @lingua/tokens — Phase 2 Style Dictionary v4 build
 *
 * Reads:  ../../tokens/lingua-tokens.json  (Tokens Studio three-set format)
 * Emits:
 *   dist/css/lingua.light.css        — :root semantic vars + global primitives
 *   dist/css/lingua.dark.css         — [data-theme="dark"] overrides
 *   dist/js/tokens.{mjs,js,d.ts}    — typed ES module / CJS exports
 *   dist/tailwind/lingua.tailwind.js — Tailwind CSS theme preset
 *   dist/figma/lingua-figma-tokens.json — resolved Tokens Studio JSON
 */

import StyleDictionary from 'style-dictionary';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { shadowTransform }                            from './transforms/shadow.mjs';
import { hexToHslTriplet, SHADCN_NAME_MAP, SHADCN_ALIASES } from './transforms/shadcn.mjs';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT_TOKENS = resolve(__dirname, '../../tokens/lingua-tokens.json');
const DIST = resolve(__dirname, 'dist');

// ─── Utility helpers ──────────────────────────────────────────────────────────

/** camelCase → kebab-case, leaves numbers and existing lowercase unchanged. */
function toKebab(str) {
  return str.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`);
}

/**
 * Derive CSS custom property name from a token path array.
 * - global tokens:  ['global','color','primary','500'] → '--global-color-primary-500'
 * - semantic tokens:['light','color','primaryFg']      → '--color-primary-fg'
 */
function cssVar(path) {
  if (path[0] === 'global') {
    return '--global-' + path.slice(1).map(toKebab).join('-');
  }
  return '--' + path.slice(1).map(toKebab).join('-');
}

/** Shadow array → CSS box-shadow string (also called in non-SD contexts). */
function shadowStr(value) {
  if (typeof value === 'string') return value;
  const list = Array.isArray(value) ? value : [value];
  return list.map(({ x, y, blur, spread, color }) =>
    [x, y, blur, spread, color].filter(Boolean).join(' ')
  ).join(', ');
}

// ─── Custom SD format definitions ────────────────────────────────────────────

function formatCssLight({ dictionary }) {
  const light  = dictionary.allTokens.filter(t => t.path[0] === 'light');
  const global = dictionary.allTokens.filter(t => t.path[0] === 'global');

  const semanticVars = light
    .map(t => `  ${cssVar(t.path)}: ${t.value};`)
    .join('\n');

  const primitiveVars = global
    .filter(t => t.path[2] !== 'category')
    .map(t => `  ${cssVar(t.path)}: ${t.value};`)
    .join('\n');

  const categoryVars = global
    .filter(t => t.path[1] === 'color' && t.path[2] === 'category')
    .map(t => `  --cat-${toKebab(t.path[3])}: ${t.value};`)
    .join('\n');

  return [
    '/* @lingua/tokens — light theme */',
    '/* Auto-generated. Edit tokens/lingua-tokens.json then run: pnpm tokens:build */',
    '',
    ':root {',
    '  /* ─── Semantic (light) ─── */',
    semanticVars,
    '',
    '  /* ─── Global primitives ─── */',
    primitiveVars,
    '',
    '  /* ─── Category colours ─── */',
    categoryVars,
    '}',
    '',
  ].join('\n');
}

function formatCssDark({ dictionary }) {
  const dark = dictionary.allTokens.filter(t => t.path[0] === 'dark');
  const vars = dark
    .map(t => `  ${cssVar(t.path)}: ${t.value};`)
    .join('\n');

  return [
    '/* @lingua/tokens — dark theme */',
    '/* Auto-generated. Edit tokens/lingua-tokens.json then run: pnpm tokens:build */',
    '',
    '[data-theme="dark"] {',
    vars,
    '}',
    '',
  ].join('\n');
}

function formatJsEsm({ dictionary }) {
  const bySet = { global: {}, light: {}, dark: {} };

  for (const token of dictionary.allTokens) {
    const set = token.path[0];
    if (!(set in bySet)) continue;
    bySet[set][token.path.join('.')] = {
      value:  token.value,
      type:   token.type,
      cssVar: cssVar(token.path),
    };
  }

  return [
    '/* @lingua/tokens — ES module export */',
    '/* Auto-generated. Run: pnpm tokens:build */',
    '',
    `export const tokens = ${JSON.stringify(bySet, null, 2)};`,
    '',
    '/** Convenience map: token path → CSS custom property name */',
    'export const cssVars = {',
    '  light: Object.fromEntries(Object.entries(tokens.light).map(([k, v]) => [k, v.cssVar])),',
    '  dark:  Object.fromEntries(Object.entries(tokens.dark).map(([k, v]) => [k, v.cssVar])),',
    '};',
    '',
  ].join('\n');
}

function formatTailwind({ dictionary }) {
  const global = dictionary.allTokens.filter(t => t.path[0] === 'global');

  // Color scales: { primary: { 50: '#eef2ff', ... }, neutral: {...} }
  const colors = {};
  for (const t of global.filter(t => t.path[1] === 'color' && t.path[2] !== 'category')) {
    const [,, group, shade] = t.path;
    if (shade) {
      colors[group] ??= {};
      colors[group][shade] = t.value;
    }
  }

  // Category colours: { food: '#f59e0b', ... }
  const category = {};
  for (const t of global.filter(t => t.path[2] === 'category')) {
    category[t.path[3]] = t.value;
  }
  if (Object.keys(category).length) colors.category = category;

  /** Build a simple key→value scale from global.{prefix}.* tokens. */
  function scale(prefix) {
    return Object.fromEntries(
      global
        .filter(t => t.path[1] === prefix)
        .map(t => [t.path[2], t.value])
    );
  }

  const fontFamilies = Object.fromEntries(
    global
      .filter(t => t.path[1] === 'fontFamily')
      .map(t => [t.path[2], String(t.value).split(', ')])
  );

  const preset = {
    theme: {
      extend: {
        colors,
        fontFamily: fontFamilies,
        fontSize:     scale('fontSize'),
        spacing:      scale('spacing'),
        borderRadius: scale('borderRadius'),
        boxShadow:    scale('shadow'),
        fontWeight:   scale('fontWeight'),
        lineHeight:   scale('lineHeight'),
      },
    },
  };

  return [
    '/* @lingua/tokens — Tailwind CSS preset */',
    '/* Auto-generated. Run: pnpm tokens:build */',
    `module.exports = ${JSON.stringify(preset, null, 2)};`,
    '',
  ].join('\n');
}

// ─── Figma JSON (reference-resolved, no SD involvement) ──────────────────────

/**
 * Build a shadcn/ui-compatible CSS shim.
 *
 * Maps semantic vars to shadcn names + HSL triplet format:
 *   --color-primary: #4f46e5    →    --primary: 243 75% 59%
 *
 * Consumers using shadcn/ui import this single file alongside their normal
 * Tailwind setup — Tailwind's hsl(var(--primary)) usages then resolve into
 * @lingua/tokens values automatically.
 */
function buildShadcnShim(raw) {
  // Resolve light/dark to concrete hex values (using the same resolver)
  const resolved = resolveDeep(raw, raw);

  function emitBlock(selector, set) {
    const lines = [`${selector} {`];
    for (const [tokenKey, entry] of Object.entries(set.color || {})) {
      // Convert camelCase → kebab (matches our existing convention)
      const kebab    = tokenKey.replace(/([A-Z])/g, (m) => `-${m.toLowerCase()}`);
      const shadcn   = SHADCN_NAME_MAP[kebab];
      if (!shadcn) continue;
      const hsl = hexToHslTriplet(entry.value);
      if (!hsl) continue;
      lines.push(`  --${shadcn}: ${hsl};`);
    }
    // Aliases (popover→card, etc.)
    for (const [alias, source] of Object.entries(SHADCN_ALIASES)) {
      const sourceToken = Object.entries(set.color || {}).find(([k]) =>
        k.replace(/([A-Z])/g, m => `-${m.toLowerCase()}`) === source
      );
      if (sourceToken) {
        const hsl = hexToHslTriplet(sourceToken[1].value);
        if (hsl) lines.push(`  --${alias}: ${hsl};`);
      }
    }
    lines.push('}');
    return lines.join('\n');
  }

  return [
    '/* @lingua/tokens — shadcn/ui-compatible CSS shim */',
    '/* Auto-generated. Run: pnpm tokens:build */',
    '/*',
    ' * Drop-in for consumer apps using shadcn/ui naming convention:',
    ' *   import "@lingua/tokens/css/lingua.shadcn.css";',
    ' * Then your existing Tailwind hsl(var(--primary)) usages resolve into',
    ' * @lingua/tokens values automatically. Bumping a token color = zero app code change.',
    ' */',
    '',
    '@layer base {',
    emitBlock('  :root', resolved.light),
    '',
    emitBlock('  .dark', resolved.dark),
    '}',
    '',
  ].join('\n');
}

function resolveDeep(node, root) {
  if (typeof node !== 'object' || node === null) return node;
  if (Array.isArray(node)) return node.map(n => resolveDeep(n, root));
  if ('value' in node) {
    const m = typeof node.value === 'string' && node.value.match(/^\{(.+)\}$/);
    if (m) {
      const target = m[1].split('.').reduce((acc, k) => acc?.[k], root);
      const resolved = target?.value ?? node.value;
      return { ...node, value: resolveDeep(resolved, root) };
    }
    return node;
  }
  return Object.fromEntries(Object.entries(node).map(([k, v]) => [k, resolveDeep(v, root)]));
}

// ─── Main build ───────────────────────────────────────────────────────────────

async function build() {
  ['css', 'js', 'tailwind', 'figma'].forEach(d =>
    mkdirSync(resolve(DIST, d), { recursive: true })
  );

  // Register shadow value transform
  StyleDictionary.registerTransform(shadowTransform);

  // Unique name transform: full path → unique token name (avoids SD collision warnings)
  StyleDictionary.registerTransform({
    name: 'lingua/name-unique',
    type: 'name',
    transform: (token) => token.path.map(toKebab).join('-'),
  });

  // Register all custom formats
  StyleDictionary.registerFormat({ name: 'lingua/css-light', format: formatCssLight });
  StyleDictionary.registerFormat({ name: 'lingua/css-dark',  format: formatCssDark  });
  StyleDictionary.registerFormat({ name: 'lingua/js-esm',    format: formatJsEsm    });
  StyleDictionary.registerFormat({ name: 'lingua/tailwind',  format: formatTailwind  });

  const raw = JSON.parse(readFileSync(ROOT_TOKENS, 'utf8'));

  const sd = new StyleDictionary({
    tokens: raw,
    platforms: {
      'css-light': {
        transforms: ['lingua/name-unique', 'lingua/shadow-css'],
        buildPath:  'dist/css/',
        files: [{ destination: 'lingua.light.css', format: 'lingua/css-light' }],
      },
      'css-dark': {
        transforms: ['lingua/name-unique', 'lingua/shadow-css'],
        buildPath:  'dist/css/',
        files: [{ destination: 'lingua.dark.css', format: 'lingua/css-dark' }],
      },
      'js-esm': {
        transforms: ['lingua/name-unique', 'lingua/shadow-css'],
        buildPath:  'dist/js/',
        files: [{ destination: 'tokens.mjs', format: 'lingua/js-esm' }],
      },
      tailwind: {
        transforms: ['lingua/name-unique', 'lingua/shadow-css'],
        buildPath:  'dist/tailwind/',
        files: [{ destination: 'lingua.tailwind.js', format: 'lingua/tailwind' }],
      },
    },
  });

  await sd.buildAllPlatforms();

  // ── CJS wrapper (wrap the ESM output) ─────────────────────────────────────
  const esm = readFileSync(resolve(DIST, 'js/tokens.mjs'), 'utf8');
  const cjs = esm
    .replace(/^export const /gm, 'const ')
    .replace(/\n$/, '')
    + '\nmodule.exports = { tokens, cssVars };\n';
  writeFileSync(resolve(DIST, 'js/tokens.js'), cjs);

  // ── TypeScript declarations ────────────────────────────────────────────────
  writeFileSync(resolve(DIST, 'js/tokens.d.ts'), [
    '/* @lingua/tokens — TypeScript declarations */',
    '/* Auto-generated. Run: pnpm tokens:build */',
    '',
    'export interface TokenEntry {',
    '  value:   unknown;',
    '  type:    string;',
    '  cssVar:  string;',
    '}',
    '',
    'export declare const tokens: {',
    '  global: Record<string, TokenEntry>;',
    '  light:  Record<string, TokenEntry>;',
    '  dark:   Record<string, TokenEntry>;',
    '};',
    '',
    'export declare const cssVars: {',
    '  light: Record<string, string>;',
    '  dark:  Record<string, string>;',
    '};',
    '',
  ].join('\n'));

  // ── Figma JSON (resolved) ──────────────────────────────────────────────────
  writeFileSync(
    resolve(DIST, 'figma/lingua-figma-tokens.json'),
    JSON.stringify(resolveDeep(raw, raw), null, 2) + '\n'
  );

  // ── shadcn/ui-compatible CSS shim (for consumer apps using shadcn) ─────────
  writeFileSync(
    resolve(DIST, 'css/lingua.shadcn.css'),
    buildShadcnShim(raw),
  );

  console.log('✓  @lingua/tokens — Phase 2 build complete');
  console.log('   dist/css/lingua.light.css');
  console.log('   dist/css/lingua.dark.css');
  console.log('   dist/css/lingua.shadcn.css      (shadcn/ui shim)');
  console.log('   dist/js/tokens.{mjs,js,d.ts}');
  console.log('   dist/tailwind/lingua.tailwind.js');
  console.log('   dist/figma/lingua-figma-tokens.json');
}

build().catch(err => { console.error(err); process.exit(1); });
