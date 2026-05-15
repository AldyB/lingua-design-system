/**
 * shadcn.mjs — Hex → HSL triplet conversion + semantic name mapping.
 *
 * shadcn/ui uses CSS variables in the form:
 *   :root { --primary: 256 76% 52%; }
 *   .dark { --primary: 256 76% 52%; }
 * and Tailwind reads them via `hsl(var(--primary))`.
 *
 * @lingua/tokens emits `--color-primary: #4f46e5;` — incompatible.
 *
 * This shim converts our semantic vars to shadcn names + HSL format, so
 * consumer apps using shadcn/ui (lingua-cards) get a drop-in replacement.
 */

/** Convert "#4f46e5" → "243 75% 59%" (space-separated HSL triplet). */
export function hexToHslTriplet(hex) {
  if (typeof hex !== 'string' || !hex.startsWith('#')) return null;
  const h = hex.replace('#', '');
  if (h.length !== 6) return null;

  const r = parseInt(h.slice(0, 2), 16) / 255;
  const g = parseInt(h.slice(2, 4), 16) / 255;
  const b = parseInt(h.slice(4, 6), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l   = (max + min) / 2;
  let h_, s;

  if (max === min) {
    h_ = s = 0;
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h_ = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h_ = (b - r) / d + 2; break;
      case b: h_ = (r - g) / d + 4; break;
    }
    h_ /= 6;
  }

  return `${Math.round(h_ * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

/**
 * Map @lingua/tokens semantic name → shadcn/ui name.
 * Pre-converted to kebab-case (light.color.primaryFg → primary-fg → primary-foreground).
 */
export const SHADCN_NAME_MAP = {
  background:        'background',
  foreground:        'foreground',
  card:              'card',
  'card-foreground': 'card-foreground',
  primary:           'primary',
  'primary-fg':      'primary-foreground',
  secondary:         'secondary',
  'secondary-fg':    'secondary-foreground',
  muted:             'muted',
  'muted-fg':        'muted-foreground',
  accent:            'accent',
  'accent-fg':       'accent-foreground',
  destructive:       'destructive',
  'destructive-fg':  'destructive-foreground',
  border:            'border',
  input:             'input',
  ring:              'ring',
};

/**
 * Aliases — shadcn/ui has vars we don't (popover-*); map them to
 * the closest semantic equivalent.
 */
export const SHADCN_ALIASES = {
  popover:              'card',
  'popover-foreground': 'card-foreground',
};
