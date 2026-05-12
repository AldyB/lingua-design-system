/**
 * Lingua DS — Component Builder (Figma Plugin)
 * Phase 6: Creates all 21 @lingua/react components as Figma ComponentSets
 * using Variables from Phase 5. No hardcoded colours. Auto-layout everywhere.
 *
 * Run once on a fresh "Lingua DS" file after the figma-push script has
 * populated Variables (Phase 5). Re-running will create duplicates — clear
 * the Components page first.
 */

// ─── UI ───────────────────────────────────────────────────────────────────────

figma.showUI(__html__, { themeColors: true, width: 380, height: 460 });

figma.ui.onmessage = async (msg) => {
  if (msg.type === 'build') {
    try {
      await buildAll();
      figma.ui.postMessage({ type: 'done' });
    } catch (err) {
      console.error(err);
      figma.ui.postMessage({ type: 'error', text: String(err.message || err) });
    }
  }
  if (msg.type === 'close') figma.closePlugin();
};

// ─── Progress helper ──────────────────────────────────────────────────────────

function log(text, ok = true) {
  figma.ui.postMessage({ type: 'progress', text, ok });
}

// ─── Variable cache ───────────────────────────────────────────────────────────

const V = {};    // { "COLOR:primary": VariableObj, "FLOAT:spacing/4": VariableObj, ... }

function buildCache() {
  for (const v of figma.variables.getLocalVariables()) {
    V[v.resolvedType + ':' + v.name] = v;
  }
}

const cv  = (name) => V['COLOR:'  + name];  // color variable
const fv  = (name) => V['FLOAT:'  + name];  // float variable
const sv  = (name) => V['STRING:' + name];  // string variable

// ─── Font loading ─────────────────────────────────────────────────────────────

async function loadFonts() {
  // "Semi Bold" (with space) is correct for Inter in Figma — not "SemiBold"
  const fonts = [
    { family: 'Inter', style: 'Regular'   },
    { family: 'Inter', style: 'Medium'    },
    { family: 'Inter', style: 'Semi Bold' },
    { family: 'Inter', style: 'Bold'      },
  ];
  await Promise.all(fonts.map(f => figma.loadFontAsync(f)));
}

// ─── Style helpers ────────────────────────────────────────────────────────────

/** Apply a COLOR variable as the node's fill. */
function applyFill(node, varName) {
  const v = cv(varName);
  if (!v) { log(`⚠ Missing COLOR var: ${varName}`, false); return; }
  node.fills = [{
    type: 'SOLID',
    color: { r: 0.85, g: 0.85, b: 0.85 },   // placeholder overridden by variable
    boundVariables: { color: { type: 'VARIABLE_ALIAS', id: v.id } },
  }];
}

/** Apply a COLOR variable as the node's stroke. */
function applyStroke(node, varName, weight = 1) {
  const v = cv(varName);
  if (!v) return;
  node.strokes = [{
    type: 'SOLID',
    color: { r: 0.8, g: 0.8, b: 0.8 },
    boundVariables: { color: { type: 'VARIABLE_ALIAS', id: v.id } },
  }];
  node.strokeWeight  = weight;
  node.strokeAlign   = 'INSIDE';
}

/** Apply a FLOAT variable to a scalar property (cornerRadius, padding, etc). */
function applyFloat(node, prop, varName) {
  const v = fv(varName);
  if (!v) return;
  if (prop === 'cornerRadius') node.cornerRadius = 8; // placeholder
  node.setBoundVariable(prop, v);
}

/** Set padding + gap via FLOAT variables. */
function applyLayout(node, { padV, padH, gap, dir = 'HORIZONTAL', align = 'CENTER' } = {}) {
  node.layoutMode             = dir;
  node.primaryAxisSizingMode  = 'AUTO';
  node.counterAxisSizingMode  = 'AUTO';
  node.primaryAxisAlignItems  = align;
  node.counterAxisAlignItems  = 'CENTER';
  if (padV) { applyFloat(node, 'paddingTop', padV);  applyFloat(node, 'paddingBottom', padV); }
  if (padH) { applyFloat(node, 'paddingLeft', padH); applyFloat(node, 'paddingRight', padH); }
  if (gap)  applyFloat(node, 'itemSpacing', gap);
}

/** Create a text node bound to SIZE variables. */
function makeText(chars, { size = 'fontSize/sm', weight = 'Regular', color = 'foreground', align = 'CENTER' } = {}) {
  const t = figma.createText();
  t.fontName             = { family: 'Inter', style: weight };
  t.characters           = chars;
  t.textAlignHorizontal  = align;
  applyFloat(t, 'fontSize', size);
  applyFill(t, color);
  return t;
}

/** Create a solid rectangle (divider line, etc). */
function makeRect(w, h, colorVar) {
  const r = figma.createRectangle();
  r.resize(w, h);
  if (colorVar) applyFill(r, colorVar);
  return r;
}

// ─── Component factory ────────────────────────────────────────────────────────

/** Create a named ComponentSet from an array of Components. */
function makeSet(name, comps, { description = '', url = '' } = {}) {
  const set = figma.combineAsVariants(comps, figma.currentPage);
  set.name        = name;
  set.description = url ? `${description}\n\nStorybook: ${url}` : description;
  // Spacing between variants inside the set
  set.itemSpacing        = 16;
  set.counterSpacing     = 16;
  set.paddingLeft        = 16;
  set.paddingRight       = 16;
  set.paddingTop         = 16;
  set.paddingBottom      = 16;
  return set;
}

/** Stroke the component set container with the border variable. */
function borderSet(set) {
  applyStroke(set, 'border');
  applyFloat(set, 'cornerRadius', 'radius/xl');
}

// ─── BUTTON ───────────────────────────────────────────────────────────────────

function buildButtonVariant(variant, size) {
  const comp = figma.createComponent();
  comp.name  = `Variant=${variant}, Size=${size}`;

  const pads = { SM: ['spacing/1', 'spacing/3'], MD: ['spacing/2', 'spacing/4'], LG: ['spacing/3', 'spacing/6'] };
  const fs   = { SM: 'fontSize/xs', MD: 'fontSize/sm', LG: 'fontSize/base' };

  applyLayout(comp, { padV: pads[size][0], padH: pads[size][1], gap: 'spacing/2' });
  applyFloat(comp, 'cornerRadius', 'radius/md');

  const colorMap = {
    Primary:     { bg: 'primary',     fg: 'primary-fg'     },
    Secondary:   { bg: 'secondary',   fg: 'secondary-fg'   },
    Ghost:       { bg: null,          fg: 'foreground'      },
    Outline:     { bg: null,          fg: 'foreground'      },
    Destructive: { bg: 'destructive', fg: 'destructive-fg'  },
  };

  const { bg, fg } = colorMap[variant] || colorMap.Primary;
  if (bg)                     applyFill(comp, bg);
  else                        comp.fills = [];
  if (variant === 'Outline')  applyStroke(comp, 'border');

  const label = makeText(variant, { size: fs[size], weight: 'Medium', color: fg });
  comp.appendChild(label);
  return comp;
}

async function buildButton() {
  const variants = ['Primary', 'Secondary', 'Ghost', 'Outline', 'Destructive'];
  const sizes    = ['SM', 'MD', 'LG'];
  const comps    = [];
  for (const v of variants) for (const s of sizes) comps.push(buildButtonVariant(v, s));
  const set = makeSet('Button', comps, { description: 'Primary, Secondary, Ghost, Outline, Destructive × SM/MD/LG', url: 'http://localhost:6006/?path=/story/primitives-button--primary' });
  borderSet(set);
  return set;
}

// ─── BADGE ────────────────────────────────────────────────────────────────────

function buildBadge() {
  const defs = [
    { v: 'Default',     bg: 'secondary',   fg: 'secondary-fg'   },
    { v: 'Primary',     bg: 'accent',      fg: 'accent-fg'      },
    { v: 'Success',     bg: null,          fg: 'foreground'      },
    { v: 'Warning',     bg: null,          fg: 'foreground'      },
    { v: 'Destructive', bg: 'destructive', fg: 'destructive-fg'  },
  ];
  const comps = defs.map(({ v, bg, fg }) => {
    const comp = figma.createComponent();
    comp.name  = `Variant=${v}`;
    applyLayout(comp, { padV: 'spacing/1', padH: 'spacing/3', gap: 'spacing/1' });
    applyFloat(comp, 'cornerRadius', 'radius/full');
    if (bg) applyFill(comp, bg); else comp.fills = [];
    comp.appendChild(makeText(v, { size: 'fontSize/xs', weight: 'Semi Bold', color: fg }));
    return comp;
  });
  const set = makeSet('Badge', comps, { url: 'http://localhost:6006/?path=/story/primitives-badge--default' });
  borderSet(set);
  return set;
}

// ─── PILL ─────────────────────────────────────────────────────────────────────

function buildPill() {
  const comp = figma.createComponent();
  comp.name  = 'Variant=Default';
  applyLayout(comp, { padV: 'spacing/1', padH: 'spacing/3' });
  applyFloat(comp, 'cornerRadius', 'radius/full');
  applyFill(comp, 'muted');
  applyStroke(comp, 'border');
  comp.appendChild(makeText('🔥 5 day streak', { size: 'fontSize/xs', weight: 'Medium', color: 'muted-fg' }));
  return makeSet('Pill', [comp], { url: 'http://localhost:6006/?path=/story/primitives-pill--default' });
}

// ─── TAG ──────────────────────────────────────────────────────────────────────

function buildTag() {
  const comps = ['Default', 'Removable'].map(v => {
    const comp = figma.createComponent();
    comp.name  = `Variant=${v}`;
    applyLayout(comp, { padV: 'spacing/1', padH: 'spacing/3', gap: 'spacing/1' });
    applyFloat(comp, 'cornerRadius', 'radius/full');
    applyFill(comp, 'accent');
    comp.appendChild(makeText('Food', { size: 'fontSize/xs', weight: 'Medium', color: 'accent-fg' }));
    if (v === 'Removable') {
      const x = makeText('×', { size: 'fontSize/xs', weight: 'Bold', color: 'accent-fg' });
      comp.appendChild(x);
    }
    return comp;
  });
  const set = makeSet('Tag', comps, { url: 'http://localhost:6006/?path=/story/primitives-tag--default' });
  borderSet(set);
  return set;
}

// ─── AVATAR ───────────────────────────────────────────────────────────────────

function buildAvatar() {
  const sizes = [
    { name: 'SM', w: 32, h: 32, fs: 'fontSize/xs' },
    { name: 'MD', w: 40, h: 40, fs: 'fontSize/sm' },
    { name: 'LG', w: 56, h: 56, fs: 'fontSize/lg' },
  ];
  const comps = sizes.map(({ name, w, h, fs }) => {
    const comp = figma.createComponent();
    comp.name  = `Size=${name}`;
    comp.resize(w, h);
    applyLayout(comp, {});
    applyFloat(comp, 'cornerRadius', 'radius/full');
    applyFill(comp, 'muted');
    applyStroke(comp, 'border');
    comp.appendChild(makeText('AB', { size: fs, weight: 'Semi Bold', color: 'muted-fg' }));
    return comp;
  });
  const set = makeSet('Avatar', comps, { url: 'http://localhost:6006/?path=/story/primitives-avatar--fallback' });
  borderSet(set);
  return set;
}

// ─── CARD ─────────────────────────────────────────────────────────────────────

function buildCard() {
  const defs = ['Default', 'Interactive'];
  const comps = defs.map(v => {
    const comp = figma.createComponent();
    comp.name  = `Variant=${v}`;
    applyLayout(comp, { dir: 'VERTICAL', padV: 'spacing/6', padH: 'spacing/6', gap: 'spacing/2', align: 'MIN' });
    applyFloat(comp, 'cornerRadius', 'radius/2xl');
    applyFill(comp, 'card');
    applyStroke(comp, 'border');

    const title = makeText('Card Title', { size: 'fontSize/base', weight: 'Bold', color: 'foreground', align: 'LEFT' });
    const body  = makeText('Card content goes here.', { size: 'fontSize/sm', weight: 'Regular', color: 'muted-fg', align: 'LEFT' });
    title.layoutSizingHorizontal = 'FILL';
    body.layoutSizingHorizontal  = 'FILL';
    comp.resize(320, comp.height);
    comp.layoutSizingHorizontal = 'FIXED';
    comp.appendChild(title);
    comp.appendChild(body);
    return comp;
  });
  const set = makeSet('Card', comps, { url: 'http://localhost:6006/?path=/story/surfaces-card--default' });
  borderSet(set);
  return set;
}

// ─── SHEET (bottom drawer) ───────────────────────────────────────────────────

function buildSheet() {
  const comp = figma.createComponent();
  comp.name  = 'Variant=Default';
  comp.resize(375, 280);
  comp.layoutMode             = 'VERTICAL';
  comp.primaryAxisSizingMode  = 'FIXED';
  comp.counterAxisSizingMode  = 'FIXED';
  comp.primaryAxisAlignItems  = 'MIN';
  comp.counterAxisAlignItems  = 'CENTER';
  applyFloat(comp, 'paddingTop',    'spacing/2');
  applyFloat(comp, 'paddingBottom', 'spacing/10');
  applyFloat(comp, 'paddingLeft',   'spacing/6');
  applyFloat(comp, 'paddingRight',  'spacing/6');
  applyFloat(comp, 'itemSpacing',   'spacing/4');
  applyFloat(comp, 'cornerRadius',  'radius/2xl');
  applyFill(comp, 'card');
  // Handle indicator
  const handle = figma.createRectangle();
  handle.resize(36, 4); handle.cornerRadius = 2;
  applyFill(handle, 'muted-fg');
  handle.opacity = 0.3;
  handle.layoutAlign = 'CENTER';
  comp.appendChild(handle);
  comp.appendChild(makeText('Sheet Title', { size: 'fontSize/lg', weight: 'Bold', color: 'foreground', align: 'LEFT' }));
  comp.appendChild(makeText('Sheet content goes here.', { size: 'fontSize/sm', weight: 'Regular', color: 'muted-fg', align: 'LEFT' }));
  return makeSet('Sheet', [comp], { url: 'http://localhost:6006/?path=/story/surfaces-sheet--default' });
}

// ─── TEXT FIELD ───────────────────────────────────────────────────────────────

function buildTextField() {
  const defs = ['Default', 'Error', 'Disabled'];
  const comps = defs.map(v => {
    const comp = figma.createComponent();
    comp.name  = `State=${v}`;
    applyLayout(comp, { dir: 'VERTICAL', padV: 'spacing/2', padH: 'spacing/3', gap: 'spacing/1', align: 'MIN' });
    applyFloat(comp, 'cornerRadius', 'radius/md');
    applyFill(comp, 'background');
    applyStroke(comp, v === 'Error' ? 'destructive' : 'input');
    comp.resize(240, comp.height);
    comp.layoutSizingHorizontal = 'FIXED';
    const placeholder = makeText(v === 'Error' ? 'Invalid input' : 'Placeholder text',
      { size: 'fontSize/sm', weight: 'Regular', color: 'muted-fg', align: 'LEFT' });
    placeholder.layoutSizingHorizontal = 'FILL';
    comp.appendChild(placeholder);
    if (v === 'Disabled') comp.opacity = 0.5;
    return comp;
  });
  const set = makeSet('TextField', comps, { url: 'http://localhost:6006/?path=/story/inputs-text-field--default' });
  borderSet(set);
  return set;
}

// ─── SELECT ───────────────────────────────────────────────────────────────────

function buildSelect() {
  const comp = figma.createComponent();
  comp.name  = 'Variant=Default';
  applyLayout(comp, { padV: 'spacing/2', padH: 'spacing/3', gap: 'spacing/2' });
  applyFloat(comp, 'cornerRadius', 'radius/md');
  applyFill(comp, 'background');
  applyStroke(comp, 'input');
  comp.resize(200, comp.height);
  comp.layoutSizingHorizontal = 'FIXED';
  const t = makeText('Select option', { size: 'fontSize/sm', weight: 'Regular', color: 'muted-fg', align: 'LEFT' });
  t.layoutSizingHorizontal = 'FILL';
  comp.appendChild(t);
  comp.appendChild(makeText('▾', { size: 'fontSize/sm', weight: 'Regular', color: 'muted-fg' }));
  return makeSet('Select', [comp], { url: 'http://localhost:6006/?path=/story/inputs-select--default' });
}

// ─── CHECKBOX ─────────────────────────────────────────────────────────────────

function buildCheckbox() {
  const defs = ['Unchecked', 'Checked', 'Disabled'];
  const comps = defs.map(v => {
    const comp = figma.createComponent();
    comp.name  = `State=${v}`;
    applyLayout(comp, { padV: 'spacing/1', padH: 'spacing/1', gap: 'spacing/2' });
    // Box
    const box = figma.createRectangle();
    box.resize(16, 16); box.cornerRadius = 4;
    applyStroke(box, 'border', 1.5);
    if (v === 'Checked') {
      applyFill(box, 'primary');
      applyStroke(box, 'primary', 1.5);
    } else { box.fills = []; }
    comp.appendChild(box);
    comp.appendChild(makeText('Label', { size: 'fontSize/sm', weight: 'Regular', color: v === 'Disabled' ? 'muted-fg' : 'foreground' }));
    if (v === 'Disabled') comp.opacity = 0.5;
    return comp;
  });
  const set = makeSet('Checkbox', comps, { url: 'http://localhost:6006/?path=/story/inputs-checkbox--default' });
  borderSet(set);
  return set;
}

// ─── RADIO GROUP ─────────────────────────────────────────────────────────────

function buildRadioGroup() {
  const comp = figma.createComponent();
  comp.name  = 'Variant=Default';
  applyLayout(comp, { dir: 'VERTICAL', padV: 'spacing/1', padH: 'spacing/1', gap: 'spacing/2', align: 'MIN' });
  ['Option A', 'Option B', 'Option C'].forEach((label, i) => {
    const row = figma.createFrame();
    applyLayout(row, { padV: 'spacing/1', padH: 'spacing/1', gap: 'spacing/2' });
    row.fills = [];
    const dot = figma.createEllipse();
    dot.resize(16, 16);
    dot.strokes = [];
    if (i === 0) applyFill(dot, 'primary'); else { dot.fills = []; applyStroke(dot, 'border', 1.5); }
    row.appendChild(dot);
    row.appendChild(makeText(label, { size: 'fontSize/sm', weight: 'Regular', color: 'foreground' }));
    comp.appendChild(row);
  });
  return makeSet('RadioGroup', [comp], { url: 'http://localhost:6006/?path=/story/inputs-radio-group--daily-goal' });
}

// ─── SWITCH ───────────────────────────────────────────────────────────────────

function buildSwitch() {
  const defs = ['Off', 'On'];
  const comps = defs.map(v => {
    const comp = figma.createComponent();
    comp.name  = `State=${v}`;
    applyLayout(comp, { gap: 'spacing/2' });
    // Track
    const track = figma.createRectangle();
    track.resize(44, 24); track.cornerRadius = 12;
    if (v === 'On') applyFill(track, 'primary');
    else { applyFill(track, 'muted'); applyStroke(track, 'border'); }
    comp.appendChild(track);
    comp.appendChild(makeText('Toggle', { size: 'fontSize/sm', weight: 'Regular', color: 'foreground' }));
    return comp;
  });
  const set = makeSet('Switch', comps, { url: 'http://localhost:6006/?path=/story/inputs-switch--default' });
  borderSet(set);
  return set;
}

// ─── PROGRESS BAR ────────────────────────────────────────────────────────────

function buildProgressBar() {
  const defs = [
    { v: 'Default', pct: 0.67, fillColor: 'primary'     },
    { v: 'Success', pct: 1.0,  fillColor: null           },
    { v: 'Warning', pct: 0.3,  fillColor: null           },
  ];
  const comps = defs.map(({ v, pct, fillColor }) => {
    const comp = figma.createComponent();
    comp.name  = `Variant=${v}`;
    comp.resize(240, 8);
    applyFloat(comp, 'cornerRadius', 'radius/full');
    applyFill(comp, 'muted');
    // Fill bar (inner frame)
    const bar = figma.createRectangle();
    bar.resize(Math.round(240 * pct), 8);
    bar.cornerRadius = 99;
    if (fillColor) applyFill(bar, fillColor);
    else applyFill(bar, 'primary');
    comp.appendChild(bar);
    bar.x = 0;
    return comp;
  });
  const set = makeSet('ProgressBar', comps, { description: 'role="progressbar", aria-valuenow bound to value prop', url: 'http://localhost:6006/?path=/story/feedback-progress-bar--half-way' });
  borderSet(set);
  return set;
}

// ─── SPINNER ─────────────────────────────────────────────────────────────────

function buildSpinner() {
  const sizes = [
    { name: 'SM', size: 16, strokeW: 2 },
    { name: 'MD', size: 24, strokeW: 2 },
    { name: 'LG', size: 36, strokeW: 3 },
  ];
  const comps = sizes.map(({ name, size, strokeW }) => {
    const comp = figma.createComponent();
    comp.name  = `Size=${name}`;
    comp.resize(size, size);
    comp.fills = [];
    const ring = figma.createEllipse();
    ring.resize(size, size);
    ring.fills = [];
    ring.strokes = [{ type: 'SOLID', color: { r: 0.9, g: 0.9, b: 0.9 } }];
    ring.strokeWeight = strokeW;
    applyStroke(ring, 'muted');
    comp.appendChild(ring);
    return comp;
  });
  const set = makeSet('Spinner', comps, { description: 'role="status", aria-label="Loading…"', url: 'http://localhost:6006/?path=/story/feedback-spinner--medium' });
  borderSet(set);
  return set;
}

// ─── TOAST ───────────────────────────────────────────────────────────────────

function buildToast() {
  const defs = [
    { v: 'Default', icon: '💬', accent: 'border'       },
    { v: 'Success', icon: '✅', accent: null            },
    { v: 'Error',   icon: '❌', accent: 'destructive'   },
    { v: 'Warning', icon: '⚠️', accent: null            },
  ];
  const comps = defs.map(({ v, icon }) => {
    const comp = figma.createComponent();
    comp.name  = `Variant=${v}`;
    applyLayout(comp, { padV: 'spacing/4', padH: 'spacing/4', gap: 'spacing/3' });
    applyFloat(comp, 'cornerRadius', 'radius/xl');
    applyFill(comp, 'card');
    applyStroke(comp, 'border');
    comp.appendChild(makeText(icon, { size: 'fontSize/base', weight: 'Regular', color: 'foreground' }));
    const body = figma.createFrame();
    body.fills = [];
    body.layoutMode = 'VERTICAL';
    body.primaryAxisSizingMode = 'AUTO';
    body.counterAxisSizingMode = 'AUTO';
    body.itemSpacing = 2;
    body.appendChild(makeText(`${v} message`, { size: 'fontSize/sm', weight: 'Semi Bold', color: 'foreground', align: 'LEFT' }));
    body.appendChild(makeText('Descriptive supporting text here.', { size: 'fontSize/xs', weight: 'Regular', color: 'muted-fg', align: 'LEFT' }));
    comp.appendChild(body);
    return comp;
  });
  const set = makeSet('Toast', comps, { description: 'role="status", aria-live="polite"', url: 'http://localhost:6006/?path=/story/feedback-toast--default' });
  borderSet(set);
  return set;
}

// ─── BOTTOM NAV ───────────────────────────────────────────────────────────────

function buildBottomNav() {
  const comp = figma.createComponent();
  comp.name  = 'Variant=Default';
  comp.resize(375, 64);
  comp.layoutMode             = 'HORIZONTAL';
  comp.primaryAxisSizingMode  = 'FIXED';
  comp.counterAxisSizingMode  = 'FIXED';
  comp.primaryAxisAlignItems  = 'SPACE_BETWEEN';
  comp.counterAxisAlignItems  = 'CENTER';
  applyFloat(comp, 'paddingLeft',  'spacing/2');
  applyFloat(comp, 'paddingRight', 'spacing/2');
  applyFill(comp, 'card');
  applyStroke(comp, 'border');
  comp.strokeAlign = 'OUTSIDE';

  const navItems = [
    { label: 'Home',     icon: '🏠', active: true  },
    { label: 'Study',    icon: '📖', active: false },
    { label: 'Create',   icon: '➕', active: false },
    { label: 'Progress', icon: '📈', active: false },
  ];

  navItems.forEach(({ label, icon, active }) => {
    const item = figma.createFrame();
    item.fills = [];
    item.layoutMode = 'VERTICAL';
    item.primaryAxisSizingMode = 'AUTO';
    item.counterAxisSizingMode = 'AUTO';
    item.primaryAxisAlignItems = 'CENTER';
    item.counterAxisAlignItems = 'CENTER';
    item.itemSpacing = 3;
    applyFloat(item, 'paddingTop',    'spacing/2');
    applyFloat(item, 'paddingBottom', 'spacing/2');
    applyFloat(item, 'paddingLeft',   'spacing/3');
    applyFloat(item, 'paddingRight',  'spacing/3');
    item.appendChild(makeText(icon, { size: 'fontSize/xl', weight: 'Regular', color: active ? 'primary' : 'muted-fg' }));
    item.appendChild(makeText(label, { size: 'fontSize/xs', weight: active ? 'Semi Bold' : 'Regular', color: active ? 'primary' : 'muted-fg' }));
    comp.appendChild(item);
  });

  return makeSet('BottomNav', [comp], { description: 'aria-label="Main navigation", active item has aria-current="page"', url: 'http://localhost:6006/?path=/story/navigation-bottom-nav--default' });
}

// ─── TOP BAR ─────────────────────────────────────────────────────────────────

function buildTopBar() {
  const comp = figma.createComponent();
  comp.name  = 'Variant=Default';
  comp.resize(375, 56);
  comp.layoutMode             = 'HORIZONTAL';
  comp.primaryAxisSizingMode  = 'FIXED';
  comp.counterAxisSizingMode  = 'FIXED';
  comp.counterAxisAlignItems  = 'CENTER';
  comp.primaryAxisAlignItems  = 'SPACE_BETWEEN';
  applyFloat(comp, 'paddingLeft',  'spacing/4');
  applyFloat(comp, 'paddingRight', 'spacing/4');
  applyFill(comp, 'primary');
  // Rounded bottom corners only
  const radVar = fv('radius/2xl');
  if (radVar) {
    comp.topLeftRadius     = 0;
    comp.topRightRadius    = 0;
    comp.bottomLeftRadius  = 20; // placeholder
    comp.bottomRightRadius = 20;
    comp.setBoundVariable('bottomLeftRadius',  radVar);
    comp.setBoundVariable('bottomRightRadius', radVar);
  }
  const titleGroup = figma.createFrame();
  titleGroup.fills = [];
  titleGroup.layoutMode = 'VERTICAL';
  titleGroup.primaryAxisSizingMode = 'AUTO';
  titleGroup.counterAxisSizingMode = 'AUTO';
  titleGroup.itemSpacing = 2;
  titleGroup.appendChild(makeText('¡Hola!', { size: 'fontSize/lg', weight: 'Bold', color: 'primary-fg', align: 'LEFT' }));
  titleGroup.appendChild(makeText('Ready to practice?', { size: 'fontSize/xs', weight: 'Regular', color: 'primary-fg', align: 'LEFT' }));
  comp.appendChild(titleGroup);
  const actions = figma.createFrame();
  actions.fills = []; actions.layoutMode = 'HORIZONTAL';
  actions.primaryAxisSizingMode = 'AUTO'; actions.counterAxisSizingMode = 'AUTO';
  actions.itemSpacing = 8;
  actions.appendChild(makeText('⚙', { size: 'fontSize/lg', weight: 'Regular', color: 'primary-fg' }));
  actions.appendChild(makeText('🚪', { size: 'fontSize/lg', weight: 'Regular', color: 'primary-fg' }));
  comp.appendChild(actions);
  return makeSet('TopBar', [comp], { url: 'http://localhost:6006/?path=/story/navigation-top-bar--default' });
}

// ─── FLASHCARD ───────────────────────────────────────────────────────────────

function buildFlashcard() {
  const defs = [
    { v: 'Front',    bg: 'card',    textColor: 'foreground', hint: 'Tap to reveal' },
    { v: 'Back',     bg: 'primary', textColor: 'primary-fg', hint: 'Swipe to answer' },
    { v: 'Flipping', bg: 'muted',   textColor: 'muted-fg',   hint: '…' },
  ];

  const comps = defs.map(({ v, bg, textColor, hint }) => {
    const comp = figma.createComponent();
    comp.name  = `State=${v}`;
    comp.resize(320, 200);
    applyLayout(comp, { dir: 'VERTICAL', align: 'CENTER' });
    comp.layoutSizingHorizontal = 'FIXED';
    comp.layoutSizingVertical   = 'FIXED';
    applyFloat(comp, 'cornerRadius', 'radius/2xl');
    applyFill(comp, bg);
    applyStroke(comp, 'border');

    // Audio button (front only)
    if (v === 'Front') {
      const audioBtn = figma.createFrame();
      audioBtn.fills = []; audioBtn.resize(32, 32);
      audioBtn.x = 280; audioBtn.y = 12;
      audioBtn.layoutPositioning = 'ABSOLUTE';
      comp.appendChild(audioBtn);
    }

    const word = makeText(v === 'Front' ? 'perro' : v === 'Back' ? 'dog' : '···',
      { size: 'fontSize/3xl', weight: 'Bold', color: textColor });
    comp.appendChild(word);

    if (v !== 'Flipping') {
      const ex = makeText(v === 'Front' ? '"El perro es muy amigable."' : '"The dog is very friendly."',
        { size: 'fontSize/xs', weight: 'Regular', color: textColor });
      ex.opacity = v === 'Back' ? 0.6 : 1;
      comp.appendChild(ex);
    }

    const hintText = makeText(hint, { size: 'fontSize/xs', weight: 'Medium', color: textColor });
    hintText.opacity = 0.4;
    comp.appendChild(hintText);

    return comp;
  });

  const set = makeSet('Flashcard', comps, {
    description: 'Swipe right = know it (onCorrect) | Swipe left = don\'t know (onIncorrect)\n3-D CSS flip via rotateY(180deg)',
    url: 'http://localhost:6006/?path=/story/domain-flashcard--default',
  });
  borderSet(set);
  return set;
}

// ─── CATEGORY CHIP ────────────────────────────────────────────────────────────

function buildCategoryChip() {
  // One component per category (colour comes from --cat-* CSS var in code, palette var in Figma)
  const cats = ['general', 'food', 'travel', 'nature', 'people', 'work', 'home', 'health'];
  const paletteMap = {
    general: 'primary/500', food: 'primary/400', travel: 'primary/300',
    nature: 'success/500',  people: 'primary/200', work: 'primary/600',
    home: 'primary/400',   health: 'primary/500',
  };

  const comps = cats.map(cat => {
    const comp = figma.createComponent();
    comp.name  = `Category=${cat}`;
    applyLayout(comp, { padV: 'spacing/1', padH: 'spacing/2', gap: 'spacing/1' });
    applyFloat(comp, 'cornerRadius', 'radius/full');
    comp.fills = [];

    const dot = figma.createEllipse();
    dot.resize(8, 8);
    const palVar = cv(paletteMap[cat]);
    if (palVar) dot.fills = [{ type: 'SOLID', color: { r: 0.4, g: 0.4, b: 0.9 }, boundVariables: { color: { type: 'VARIABLE_ALIAS', id: palVar.id } } }];
    comp.appendChild(dot);
    comp.appendChild(makeText(cat.charAt(0).toUpperCase() + cat.slice(1), { size: 'fontSize/xs', weight: 'Semi Bold', color: 'foreground' }));
    return comp;
  });

  const set = makeSet('CategoryChip', comps, {
    description: 'Colour driven by --cat-{name} CSS var. In Figma, bind fill to palette variable.',
    url: 'http://localhost:6006/?path=/story/domain-category-chip--all-categories',
  });
  borderSet(set);
  return set;
}

// ─── STREAK COUNTER ───────────────────────────────────────────────────────────

function buildStreakCounter() {
  const counts = ['1', '5', '30'];
  const comps = counts.map(n => {
    const comp = figma.createComponent();
    comp.name  = `Days=${n}`;
    applyLayout(comp, { padV: 'spacing/1', padH: 'spacing/3', gap: 'spacing/1' });
    applyFloat(comp, 'cornerRadius', 'radius/full');
    comp.fills = [];

    comp.appendChild(makeText('🔥', { size: 'fontSize/base', weight: 'Regular', color: 'foreground' }));
    comp.appendChild(makeText(n, { size: 'fontSize/lg', weight: 'Bold', color: 'foreground' }));
    comp.appendChild(makeText(n === '1' ? 'day' : 'days', { size: 'fontSize/xs', weight: 'Regular', color: 'muted-fg' }));
    return comp;
  });

  const set = makeSet('StreakCounter', comps, {
    description: 'aria-label="{n} day streak"',
    url: 'http://localhost:6006/?path=/story/domain-streak-counter--five-days',
  });
  borderSet(set);
  return set;
}

// ─── MASTERY METER ────────────────────────────────────────────────────────────

function buildMasteryMeter() {
  const comp = figma.createComponent();
  comp.name  = 'Variant=Default';
  comp.resize(280, comp.height || 10);
  applyLayout(comp, { dir: 'VERTICAL', gap: 'spacing/3', align: 'MIN' });
  comp.layoutSizingHorizontal = 'FIXED';

  // Progress bar track
  const track = figma.createFrame();
  track.resize(280, 10);
  track.cornerRadius = 99;
  applyFill(track, 'muted');
  track.layoutSizingHorizontal = 'FILL';
  const fill_ = figma.createRectangle();
  fill_.resize(Math.round(280 * 0.8), 10);
  fill_.cornerRadius = 99;
  applyFill(fill_, 'primary');
  track.appendChild(fill_);
  comp.appendChild(track);

  // 3-slot grid (horizontal frame)
  const slots = figma.createFrame();
  slots.fills = [];
  slots.layoutMode = 'HORIZONTAL';
  slots.primaryAxisSizingMode = 'AUTO';
  slots.counterAxisSizingMode = 'AUTO';
  slots.itemSpacing = 8;
  slots.layoutSizingHorizontal = 'FILL';

  [
    { label: 'Mastered', count: '8', color: 'primary'  },
    { label: 'Learning', count: '3', color: 'foreground' },
    { label: 'New',      count: '1', color: 'muted-fg'  },
  ].forEach(({ label, count, color }) => {
    const slot = figma.createFrame();
    slot.fills = [];
    applyFill(slot, 'card');
    applyStroke(slot, 'border');
    applyFloat(slot, 'cornerRadius', 'radius/lg');
    slot.layoutMode = 'VERTICAL';
    slot.primaryAxisSizingMode = 'AUTO';
    slot.counterAxisSizingMode = 'AUTO';
    slot.primaryAxisAlignItems = 'CENTER';
    slot.counterAxisAlignItems = 'CENTER';
    slot.layoutGrow = 1;
    slot.itemSpacing = 2;
    applyFloat(slot, 'paddingTop',    'spacing/2');
    applyFloat(slot, 'paddingBottom', 'spacing/2');
    slot.appendChild(makeText(count, { size: 'fontSize/2xl', weight: 'Bold', color }));
    slot.appendChild(makeText(label, { size: 'fontSize/xs', weight: 'Regular', color: 'muted-fg' }));
    slots.appendChild(slot);
  });

  comp.appendChild(slots);
  return makeSet('MasteryMeter', [comp], {
    description: 'aria-label="Mastery: {pct}%". Bar fill width = mastered/total × 100%.',
    url: 'http://localhost:6006/?path=/story/domain-mastery-meter--default',
  });
}

// ─── Page setup ───────────────────────────────────────────────────────────────

function getOrCreatePage(name) {
  const existing = figma.root.children.find(p => p.name === name);
  if (existing) return existing;
  const page = figma.createPage();
  page.name = name;
  return page;
}

// ─── Main orchestrator ────────────────────────────────────────────────────────

async function buildAll() {
  log('Loading fonts…');
  await loadFonts();

  log('Building variable cache…');
  buildCache();
  const varCount = Object.keys(V).length;
  if (varCount === 0) {
    throw new Error('No Variables found. Run the figma-push script (Phase 5) first.');
  }
  log(`Found ${varCount} variables ✓`);

  const page = getOrCreatePage('⚛ Components');
  await figma.setCurrentPageAsync(page);

  const BUILDERS = [
    // Primitives
    { name: 'Button',        fn: buildButton       },
    { name: 'Badge',         fn: buildBadge        },
    { name: 'Pill',          fn: buildPill         },
    { name: 'Tag',           fn: buildTag          },
    { name: 'Avatar',        fn: buildAvatar       },
    // Surfaces
    { name: 'Card',          fn: buildCard         },
    { name: 'Sheet',         fn: buildSheet        },
    // Inputs
    { name: 'TextField',     fn: buildTextField    },
    { name: 'Select',        fn: buildSelect       },
    { name: 'Checkbox',      fn: buildCheckbox     },
    { name: 'RadioGroup',    fn: buildRadioGroup   },
    { name: 'Switch',        fn: buildSwitch       },
    // Feedback
    { name: 'ProgressBar',   fn: buildProgressBar  },
    { name: 'Spinner',       fn: buildSpinner      },
    { name: 'Toast',         fn: buildToast        },
    // Navigation
    { name: 'BottomNav',     fn: buildBottomNav    },
    { name: 'TopBar',        fn: buildTopBar       },
    // Domain
    { name: 'Flashcard',     fn: buildFlashcard    },
    { name: 'CategoryChip',  fn: buildCategoryChip },
    { name: 'StreakCounter',  fn: buildStreakCounter},
    { name: 'MasteryMeter',  fn: buildMasteryMeter },
  ];

  // Arrange in two columns by group
  const groups = {
    'Primitives': ['Button', 'Badge', 'Pill', 'Tag', 'Avatar'],
    'Surfaces':   ['Card', 'Sheet'],
    'Inputs':     ['TextField', 'Select', 'Checkbox', 'RadioGroup', 'Switch'],
    'Feedback':   ['ProgressBar', 'Spinner', 'Toast'],
    'Navigation': ['BottomNav', 'TopBar'],
    'Domain':     ['Flashcard', 'CategoryChip', 'StreakCounter', 'MasteryMeter'],
  };

  const MARGIN  = 80;
  const COL_GAP = 120;
  const ROW_GAP = 60;
  const COL_W   = 500;

  let colX = MARGIN;
  let colIdx = 0;

  for (const [groupName, componentNames] of Object.entries(groups)) {
    let y = MARGIN;

    // Group label
    const label = figma.createText();
    await figma.loadFontAsync({ family: 'Inter', style: 'Bold' });
    label.characters  = groupName;
    label.fontName    = { family: 'Inter', style: 'Bold' };
    label.fontSize    = 20;
    label.fills       = [{ type: 'SOLID', color: { r: 0.31, g: 0.27, b: 0.9 } }];
    label.x = colX; label.y = y;
    page.appendChild(label);
    y += 40;

    for (const name of componentNames) {
      const builder = BUILDERS.find(b => b.name === name);
      if (!builder) continue;

      log(`Building ${name}…`);
      try {
        const set = await builder.fn();
        if (set) {
          page.appendChild(set);
          set.x = colX; set.y = y;
          y += (set.height || 80) + ROW_GAP;
        }
      } catch (err) {
        log(`⚠ ${name}: ${err.message}`, false);
      }
    }

    colX  += COL_W + COL_GAP;
    colIdx++;
    // 3 columns per row
    if (colIdx % 3 === 0) { colX = MARGIN; }
  }

  // Zoom to fit the Components page
  figma.viewport.scrollAndZoomIntoView(page.children);
}
