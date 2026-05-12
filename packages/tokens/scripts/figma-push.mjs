/**
 * figma-push.mjs — Lingua DS → Figma Variables (Path B)
 *
 * Reads tokens/lingua-tokens.json and POSTs to the Figma Variables REST API.
 *
 * Phase 7: --update flag enables GET → diff → UPDATE for safe re-runs.
 *
 * Usage:
 *   FIGMA_FILE_KEY=<key> FIGMA_ACCESS_TOKEN=<token> node scripts/figma-push.mjs
 *   node scripts/figma-push.mjs --update       # idempotent: GET existing → diff → UPDATE
 *   node scripts/figma-push.mjs --dry-run      # preview payload, no API call
 *   node scripts/figma-push.mjs --save-payload # write payload.json to disk
 *
 * Requires: Node 18+ (native fetch), Figma Professional plan (Variables API)
 *
 * Collections:
 *   🎨 Lingua / Global Palette  — primitive COLOR vars (single mode)
 *   🌗 Lingua / Semantic Color  — semantic COLOR vars (Light + Dark modes, with aliases)
 *   📐 Lingua / Size            — spacing, radius, fontSize, fontWeight, lineHeight (FLOAT)
 *   ✨ Lingua / Motion          — duration (FLOAT ms) + easing (STRING)
 *   🔤 Lingua / Typography      — font-family (STRING, first font in stack)
 *
 * Idempotency (--update):
 *   First run — CREATE everything (use on fresh Figma file).
 *   Re-runs   — GET existing, resolve real Figma IDs, use UPDATE for existing
 *               and CREATE for new. Safe to run on every CI push.
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { resolve, dirname }            from 'node:path';
import { fileURLToPath }               from 'node:url';

const __dirname   = dirname(fileURLToPath(import.meta.url));
const ROOT_TOKENS = resolve(__dirname, '../../../tokens/lingua-tokens.json');

// ─── CLI / env ────────────────────────────────────────────────────────────────

const FILE_KEY     = process.env.FIGMA_FILE_KEY;
const TOKEN        = process.env.FIGMA_ACCESS_TOKEN;
const DRY_RUN      = process.argv.includes('--dry-run');
const SAVE         = process.argv.includes('--save-payload');
const UPDATE_MODE  = process.argv.includes('--update');

if (!FILE_KEY && !DRY_RUN && !SAVE) {
  console.error('Error: FIGMA_FILE_KEY env var is required (or use --dry-run)');
  process.exit(1);
}
if (!TOKEN && !DRY_RUN && !SAVE) {
  console.error('Error: FIGMA_ACCESS_TOKEN env var is required (or use --dry-run)');
  process.exit(1);
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Parse hex string → Figma color object {r,g,b,a} with 0–1 range. */
function hexToFigmaColor(hex) {
  if (typeof hex !== 'string' || !hex.startsWith('#')) return null;
  const h = hex.replace('#', '');
  if (h.length !== 6 && h.length !== 8) return null;
  return {
    r: parseInt(h.slice(0, 2), 16) / 255,
    g: parseInt(h.slice(2, 4), 16) / 255,
    b: parseInt(h.slice(4, 6), 16) / 255,
    a: h.length === 8 ? parseInt(h.slice(6, 8), 16) / 255 : 1,
  };
}

/** Parse "16px" or "1.5" → float. Returns null for unparseable values. */
function toFloat(val) {
  if (typeof val === 'number') return val;
  const s = String(val).trim();
  const n = parseFloat(s.replace('px', '').replace('ms', ''));
  return isNaN(n) ? null : n;
}

/** Return the inner path of a {reference} token value, or null. */
function parseRef(value) {
  if (typeof value !== 'string') return null;
  const m = value.match(/^\{(.+)\}$/);
  return m ? m[1] : null;
}

/** Flatten a nested token object into [{path, value, type, ...}]. */
function flatten(obj, prefix = '') {
  return Object.entries(obj).flatMap(([key, val]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    if (val && typeof val === 'object' && !Array.isArray(val) && 'value' in val) {
      return [{ path, ...val }];
    }
    if (val && typeof val === 'object' && !Array.isArray(val)) {
      return flatten(val, path);
    }
    return [];
  });
}

/** Stable temp ID — Figma resolves these within a single POST transaction. */
const vid = (path) => `var:${path}`;

// ─── Figma existing-state fetch (--update mode) ───────────────────────────────

/**
 * GET /v1/files/:key/variables/local and build lookup tables.
 * Returns { colByName, varByKey, modeByKey } for id resolution.
 *
 * colByName:  "🎨 Lingua / Global Palette" → { id, modes: { "Global" → modeId } }
 * varByKey:   "collectionId/varName"         → real Figma variable ID
 */
async function fetchExistingState() {
  const res = await fetch(
    `https://api.figma.com/v1/files/${FILE_KEY}/variables/local`,
    { headers: { 'X-Figma-Token': TOKEN } }
  );
  if (!res.ok) {
    throw new Error(`GET variables/local failed: ${res.status} ${await res.text()}`);
  }
  const { meta } = await res.json();
  const cols = meta?.variableCollections ?? {};
  const vars = meta?.variables          ?? {};

  const colByName = {};
  for (const [id, col] of Object.entries(cols)) {
    colByName[col.name] = {
      id,
      modes: Object.fromEntries((col.modes ?? []).map(m => [m.name, m.modeId])),
    };
  }

  const varByKey = {};
  for (const [id, v] of Object.entries(vars)) {
    const colName = cols[v.variableCollectionId]?.name;
    if (colName) varByKey[`${colName}/${v.name}`] = id;
  }

  return { colByName, varByKey };
}

/**
 * Resolve a collection definition to the right action + real/temp id.
 * In UPDATE mode, existing collections use their real Figma id.
 */
function resolveCollection(name, tempId, initialModeId, existing) {
  if (!existing) return { action: 'CREATE', id: tempId, initialModeId };
  const found = existing.colByName[name];
  return found
    ? { action: 'UPDATE', id: found.id }           // UPDATE: no initialModeId needed
    : { action: 'CREATE', id: tempId, initialModeId };
}

/**
 * Resolve a mode definition to action + real/temp id.
 */
function resolveMode(colName, modeName, tempId, colId, existing) {
  if (!existing) return { action: 'CREATE', id: tempId, name: modeName, variableCollectionId: colId };
  const col   = existing.colByName[colName];
  const modeId = col?.modes[modeName];
  const realColId = col?.id ?? colId;
  return modeId
    ? { action: 'UPDATE', id: modeId, name: modeName, variableCollectionId: realColId }
    : { action: 'CREATE', id: tempId, name: modeName, variableCollectionId: realColId };
}

/**
 * Resolve a variable definition to action + real/temp id.
 */
function resolveVar(colName, varName, tempVarId, colId, resolvedType, scopes, desc, existing) {
  if (!existing) return {
    action: 'CREATE', id: tempVarId, name: varName,
    variableCollectionId: colId, resolvedType, scopes, description: desc,
  };
  const col    = existing.colByName[colName];
  const realColId = col?.id ?? colId;
  const realVarId = existing.varByKey[`${colName}/${varName}`];
  return realVarId
    ? { action: 'UPDATE', id: realVarId, name: varName, variableCollectionId: realColId, resolvedType, scopes, description: desc }
    : { action: 'CREATE', id: tempVarId, name: varName, variableCollectionId: realColId, resolvedType, scopes, description: desc };
}

/**
 * Resolve the action for a variable value (CREATE for new vars, UPDATE for existing).
 */
function resolveValueAction(varDef) {
  return varDef.action === 'UPDATE' ? 'UPDATE' : 'CREATE';
}

// ─── Load tokens ──────────────────────────────────────────────────────────────

const raw = JSON.parse(readFileSync(ROOT_TOKENS, 'utf8'));

const globalTokens = flatten(raw.global, 'global');
const lightTokens  = flatten(raw.light,  'light');
const darkTokens   = flatten(raw.dark,   'dark');

// Build dark token map: "X" (the key after "dark.color.") → token
const darkMap = Object.fromEntries(
  darkTokens.map(t => [t.path.replace('dark.color.', ''), t])
);

// ─── Collections + Modes ──────────────────────────────────────────────────────

const variableCollections = [
  { action: 'CREATE', id: 'col:palette',   name: '🎨 Lingua / Global Palette',  initialModeId: 'mode:palette:global' },
  { action: 'CREATE', id: 'col:semantic',  name: '🌗 Lingua / Semantic Color',   initialModeId: 'mode:semantic:light' },
  { action: 'CREATE', id: 'col:size',      name: '📐 Lingua / Size',             initialModeId: 'mode:size:default'   },
  { action: 'CREATE', id: 'col:motion',    name: '✨ Lingua / Motion',           initialModeId: 'mode:motion:default' },
  { action: 'CREATE', id: 'col:type',      name: '🔤 Lingua / Typography',       initialModeId: 'mode:type:default'   },
];

const variableModes = [
  { action: 'CREATE', id: 'mode:palette:global',   name: 'Global',   variableCollectionId: 'col:palette'  },
  { action: 'CREATE', id: 'mode:semantic:light',   name: 'Light',    variableCollectionId: 'col:semantic' },
  { action: 'CREATE', id: 'mode:semantic:dark',    name: 'Dark',     variableCollectionId: 'col:semantic' },
  { action: 'CREATE', id: 'mode:size:default',     name: 'Default',  variableCollectionId: 'col:size'     },
  { action: 'CREATE', id: 'mode:motion:default',   name: 'Default',  variableCollectionId: 'col:motion'   },
  { action: 'CREATE', id: 'mode:type:default',     name: 'Default',  variableCollectionId: 'col:type'     },
];

const variables      = [];
const variableValues = [];

// ─── 1. Global Palette — primitive colors ─────────────────────────────────────

const paletteTokens = globalTokens.filter(t =>
  t.type === 'color' && t.path.startsWith('global.color.')
);

for (const token of paletteTokens) {
  const color = hexToFigmaColor(token.value);
  if (!color) continue;

  // Name: "primary/500", "category/food", "neutral/0", etc.
  const name = token.path.replace('global.color.', '').replace(/\./g, '/');

  variables.push({
    action: 'CREATE', id: vid(token.path), name,
    variableCollectionId: 'col:palette',
    resolvedType: 'COLOR',
    scopes: ['ALL_SCOPES'],
    description: token.path,
  });
  variableValues.push({
    action: 'CREATE',
    variableId: vid(token.path),
    modeId:     'mode:palette:global',
    value:      color,
  });
}

// ─── 2. Semantic Color — light + dark modes with variable aliases ──────────────

for (const token of lightTokens) {
  const key    = token.path.replace('light.color.', '');    // e.g. "background"
  const ref    = parseRef(token.value);                     // e.g. "global.color.neutral.50"
  const dark   = darkMap[key];
  const dRef   = dark ? parseRef(dark.value) : null;

  // Figma variable name (camelCase → kebab for readability)
  const name = key.replace(/([A-Z])/g, m => `-${m.toLowerCase()}`);

  variables.push({
    action: 'CREATE', id: vid(token.path), name,
    variableCollectionId: 'col:semantic',
    resolvedType: 'COLOR',
    scopes: ['ALL_SCOPES'],
    description: `light: ${token.value}${dark ? ` | dark: ${dark.value}` : ''}`,
  });

  // Light mode — alias to global palette if reference, else raw color
  variableValues.push({
    action: 'CREATE',
    variableId: vid(token.path),
    modeId:     'mode:semantic:light',
    value: ref
      ? { type: 'VARIABLE_ALIAS', id: vid(ref) }
      : (hexToFigmaColor(token.value) ?? { r: 0, g: 0, b: 0, a: 1 }),
  });

  // Dark mode
  if (dark) {
    variableValues.push({
      action: 'CREATE',
      variableId: vid(token.path),
      modeId:     'mode:semantic:dark',
      value: dRef
        ? { type: 'VARIABLE_ALIAS', id: vid(dRef) }
        : (hexToFigmaColor(dark.value) ?? { r: 0, g: 0, b: 0, a: 1 }),
    });
  }
}

// ─── 3. Size — spacing, radius, fontSize, fontWeight, lineHeight ───────────────

const SIZE_GROUPS = [
  { match: 'global.spacing.',      figmaPrefix: 'spacing/',    scopes: ['WIDTH_HEIGHT', 'GAP'] },
  { match: 'global.borderRadius.', figmaPrefix: 'radius/',     scopes: ['CORNER_RADIUS']       },
  { match: 'global.fontSize.',     figmaPrefix: 'fontSize/',   scopes: ['FONT_SIZE']           },
  { match: 'global.fontWeight.',   figmaPrefix: 'fontWeight/', scopes: ['FONT_WEIGHT']         },
  { match: 'global.lineHeight.',   figmaPrefix: 'lineHeight/', scopes: ['LINE_HEIGHT']         },
];

for (const { match, figmaPrefix, scopes } of SIZE_GROUPS) {
  const group = globalTokens.filter(t => t.path.startsWith(match));
  for (const token of group) {
    const float = toFloat(token.value);
    if (float === null) continue;

    const name = figmaPrefix + token.path.replace(match, '');

    variables.push({
      action: 'CREATE', id: vid(token.path), name,
      variableCollectionId: 'col:size',
      resolvedType: 'FLOAT',
      scopes,
      description: `${token.value}`,
    });
    variableValues.push({
      action: 'CREATE',
      variableId: vid(token.path),
      modeId:     'mode:size:default',
      value:      float,
    });
  }
}

// ─── 4. Motion — duration (FLOAT ms) + easing (STRING) ───────────────────────

const durationTokens = globalTokens.filter(t => t.path.startsWith('global.motion.duration.'));
for (const token of durationTokens) {
  const ms   = toFloat(token.value);
  if (ms === null) continue;
  const name = 'duration/' + token.path.replace('global.motion.duration.', '');

  variables.push({
    action: 'CREATE', id: vid(token.path), name,
    variableCollectionId: 'col:motion',
    resolvedType: 'FLOAT',
    scopes: ['ALL_SCOPES'],
    description: `${token.value}`,
  });
  variableValues.push({ action: 'CREATE', variableId: vid(token.path), modeId: 'mode:motion:default', value: ms });
}

const easingTokens = globalTokens.filter(t => t.path.startsWith('global.motion.easing.'));
for (const token of easingTokens) {
  const name = 'easing/' + token.path.replace('global.motion.easing.', '');

  variables.push({
    action: 'CREATE', id: vid(token.path), name,
    variableCollectionId: 'col:motion',
    resolvedType: 'STRING',
    scopes: ['ALL_SCOPES'],
    description: `${token.value}`,
  });
  variableValues.push({ action: 'CREATE', variableId: vid(token.path), modeId: 'mode:motion:default', value: String(token.value) });
}

// ─── 5. Typography — font-family (STRING, first font in stack) ────────────────

const fontFamilyTokens = globalTokens.filter(t => t.path.startsWith('global.fontFamily.'));
for (const token of fontFamilyTokens) {
  const name       = token.path.replace('global.fontFamily.', '');
  const firstFont  = String(token.value).split(',')[0].trim().replace(/["']/g, '');

  variables.push({
    action: 'CREATE', id: vid(token.path), name,
    variableCollectionId: 'col:type',
    resolvedType: 'STRING',
    scopes: ['FONT_FAMILY'],
    description: token.value,
  });
  variableValues.push({ action: 'CREATE', variableId: vid(token.path), modeId: 'mode:type:default', value: firstFont });
}

// ─── Resolve real Figma IDs (--update mode) ──────────────────────────────────

/**
 * Post-processes a CREATE payload to replace temp IDs with real Figma IDs
 * for entities that already exist. Non-existing entities keep CREATE + temp ID.
 *
 * The payload is generated with temp IDs first (fast, no network), then
 * this function replaces them after fetching existing state (--update only).
 */
function resolvePayloadIds(p, existing) {
  if (!existing) return p;

  const { colByName, varByKey } = existing;

  // ── Map temp → real for collections ──────────────────────────────────────
  const COLS = [
    { temp: 'col:palette',  name: '🎨 Lingua / Global Palette'  },
    { temp: 'col:semantic', name: '🌗 Lingua / Semantic Color'   },
    { temp: 'col:size',     name: '📐 Lingua / Size'             },
    { temp: 'col:motion',   name: '✨ Lingua / Motion'           },
    { temp: 'col:type',     name: '🔤 Lingua / Typography'       },
  ];

  const colIdMap  = {};   // tempId  → realColId
  const modeIdMap = {};   // tempId  → realModeId
  const varIdMap  = {};   // tempVarId → realVarId

  for (const { temp, name } of COLS) {
    const found = colByName[name];
    if (found) colIdMap[temp] = found.id;
  }

  // ── Modes: use real IDs from collection's mode list ────────────────────
  const MODE_DEFS = [
    { temp: 'mode:palette:global',  col: 'col:palette',  name: 'Global'  },
    { temp: 'mode:semantic:light',  col: 'col:semantic', name: 'Light'   },
    { temp: 'mode:semantic:dark',   col: 'col:semantic', name: 'Dark'    },
    { temp: 'mode:size:default',    col: 'col:size',     name: 'Default' },
    { temp: 'mode:motion:default',  col: 'col:motion',   name: 'Default' },
    { temp: 'mode:type:default',    col: 'col:type',     name: 'Default' },
  ];

  for (const { temp, col, name } of MODE_DEFS) {
    const colName   = COLS.find(c => c.temp === col)?.name;
    const modeId    = colByName[colName]?.modes[name];
    if (modeId) modeIdMap[temp] = modeId;
  }

  // ── Variables: match by collection name + variable name ─────────────────
  for (const v of p.variables) {
    const colDef  = COLS.find(c => c.temp === v.variableCollectionId);
    if (!colDef) continue;
    const realId  = varByKey[`${colDef.name}/${v.name}`];
    if (realId)  varIdMap[v.id] = realId;
  }

  // ── Rebuild with resolved IDs ────────────────────────────────────────────
  const resolveColId  = (id) => colIdMap[id]  ?? id;
  const resolveModeId = (id) => modeIdMap[id] ?? id;
  const resolveVarId  = (id) => varIdMap[id]  ?? id;

  const resolvedCollections = p.variableCollections.map(c => {
    const realId = colIdMap[c.id];
    return realId
      ? { action: 'UPDATE', id: realId, name: c.name }
      : c;
  });

  const resolvedModes = p.variableModes.map(m => {
    const realId    = modeIdMap[m.id];
    const realColId = resolveColId(m.variableCollectionId);
    return realId
      ? { action: 'UPDATE', id: realId, name: m.name, variableCollectionId: realColId }
      : { ...m, variableCollectionId: realColId };
  });

  const resolvedVariables = p.variables.map(v => {
    const realId    = varIdMap[v.id];
    const realColId = resolveColId(v.variableCollectionId);
    return realId
      ? { ...v, action: 'UPDATE', id: realId, variableCollectionId: realColId }
      : { ...v, variableCollectionId: realColId };
  });

  const resolvedValues = p.variableValues.map(val => {
    const realVarId  = resolveVarId(val.variableId);
    const realModeId = resolveModeId(val.modeId);
    const action     = varIdMap[val.variableId] ? 'UPDATE' : val.action;
    let value        = val.value;
    // Resolve VARIABLE_ALIAS target to its real ID
    if (value?.type === 'VARIABLE_ALIAS') {
      value = { ...value, id: resolveVarId(value.id) };
    }
    return { action, variableId: realVarId, modeId: realModeId, value };
  });

  return {
    variableCollections: resolvedCollections,
    variableModes:       resolvedModes,
    variables:           resolvedVariables,
    variableValues:      resolvedValues,
  };
}

// ─── Build + optionally resolve payload ───────────────────────────────────────

let basePayload = { variableCollections, variableModes, variables, variableValues };

// Fetch existing state in --update mode (safe to re-run after first push)
let existingState = null;
if (UPDATE_MODE && !DRY_RUN && !SAVE) {
  console.log('Fetching existing Figma Variables (--update mode)…');
  existingState = await fetchExistingState();
  const existingVarCount = Object.keys(existingState.varByKey).length;
  const existingColCount = Object.keys(existingState.colByName).length;
  console.log(`  Found ${existingColCount} collections, ${existingVarCount} variables`);
}

const payload = resolvePayloadIds(basePayload, existingState);

// Count CREATE vs UPDATE actions
const creates = payload.variables.filter(v => v.action === 'CREATE').length;
const updates = payload.variables.filter(v => v.action === 'UPDATE').length;

// ─── Stats ────────────────────────────────────────────────────────────────────

console.log('\nLingua DS → Figma Variables\n' + '─'.repeat(40));
if (UPDATE_MODE) {
  console.log(`Mode        : UPDATE (idempotent — ${creates} new, ${updates} existing)`);
} else {
  console.log(`Mode        : CREATE (use on fresh Figma file)`);
}
console.log(`Collections : ${payload.variableCollections.length}`);
console.log(`Modes       : ${payload.variableModes.length}`);
console.log(`Variables   : ${payload.variables.length}`);
console.log(`Values      : ${payload.variableValues.length}`);
console.log('');

const varsByCollection = {};
for (const v of payload.variables) {
  varsByCollection[v.variableCollectionId] = (varsByCollection[v.variableCollectionId] || 0) + 1;
}
console.log('By collection:');
for (const [colId, count] of Object.entries(varsByCollection)) {
  const col = payload.variableCollections.find(c => c.id === colId);
  console.log(`  ${(col?.name ?? colId).padEnd(32)} ${count} variables`);
}
console.log('');

// ─── Save payload (optional debug) ────────────────────────────────────────────

if (SAVE) {
  const out = resolve(__dirname, '../dist/figma/figma-variables-payload.json');
  writeFileSync(out, JSON.stringify(payload, null, 2) + '\n');
  console.log(`Payload saved → ${out}`);
}

// ─── Dry run ──────────────────────────────────────────────────────────────────

if (DRY_RUN) {
  console.log(`[--dry-run] No API call made. First 5 variables:`);
  for (const v of payload.variables.slice(0, 5)) {
    console.log(`  [${v.action}] ${v.id.slice(0,40).padEnd(42)} ${(v.resolvedType || '').padEnd(7)} ${v.name}`);
  }
  console.log('\n✓ Dry run complete.\n');
  process.exit(0);
}

// ─── POST to Figma Variables REST API ─────────────────────────────────────────

console.log(`Pushing to Figma file ${FILE_KEY} …\n`);

let response;
try {
  response = await fetch(`https://api.figma.com/v1/files/${FILE_KEY}/variables`, {
    method:  'POST',
    headers: { 'X-Figma-Token': TOKEN, 'Content-Type': 'application/json' },
    body:    JSON.stringify(payload),
  });
} catch (err) {
  console.error(`✗  Network error: ${err.message}`);
  process.exit(1);
}

const result = await response.json().catch(() => ({}));

if (!response.ok) {
  const code = result?.err || result?.message || response.status;
  if (response.status === 403) {
    console.error('✗  403 Forbidden — check your FIGMA_ACCESS_TOKEN.');
    console.error('   Variables API requires a Figma Professional plan.');
  } else if (response.status === 404) {
    console.error(`✗  404 Not Found — check FIGMA_FILE_KEY: ${FILE_KEY}`);
  } else {
    console.error(`✗  Figma API ${response.status}: ${code}`);
  }
  if (result?.message) console.error(`   ${result.message}`);
  process.exit(1);
}

console.log('✓  Variables pushed to Figma!\n');
console.log(`   Collections : ${variableCollections.length}`);
console.log(`   Variables   : ${variables.length}`);
console.log(`   Values      : ${variableValues.length}`);
console.log('\nOpen your Figma file → Assets panel → Variables to see them.');
console.log('Switch frames between Light and Dark mode to verify aliases resolve.');
