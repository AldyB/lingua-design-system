# Phase 6 — Figma Component Builder

This plugin creates all 21 `@lingua/react` components as Figma **ComponentSets** (variant groups) on a dedicated `⚛ Components` page. Every fill, stroke, corner radius, and spacing value is bound to a Variable from Phase 5 — no hardcoded values.

---

## Prerequisites

1. **Phase 5 complete** — Variables are already in your Figma file (run `pnpm --filter @lingua/tokens figma:push`)
2. **Figma Professional** plan (Variables require it)
3. Plugin installed in Figma

---

## Install the plugin (development mode)

Figma can load plugins from a local directory without publishing them.

1. Open your **Lingua DS** Figma file
2. Main menu → **Plugins** → **Development** → **Import plugin from manifest…**
3. Navigate to `packages/figma-plugin/manifest.json` and select it
4. The plugin now appears under **Plugins → Development → Lingua DS — Component Builder**

---

## Run the plugin

1. Open the **Lingua DS** Figma file (with Phase 5 Variables already applied)
2. Main menu → **Plugins** → **Development** → **Lingua DS — Component Builder**
3. Click **⚡ Build all components**
4. Wait ~30 seconds while all 21 components are created
5. A `⚛ Components` page is created automatically; the viewport zooms to show all components

> Re-running creates duplicates — clear the `⚛ Components` page before re-running.

---

## What is created

| Group | Components |
|---|---|
| **Primitives** | Button (5 variants × 3 sizes), Badge (5 variants), Pill, Tag (2 variants), Avatar (3 sizes) |
| **Surfaces** | Card (2 variants), Sheet |
| **Inputs** | TextField (3 states), Select, Checkbox (3 states), RadioGroup, Switch (Off/On) |
| **Feedback** | ProgressBar (3 variants), Spinner (3 sizes), Toast (4 variants) |
| **Navigation** | BottomNav, TopBar |
| **Domain** | Flashcard (Front/Back/Flipping), CategoryChip (8 categories), StreakCounter (3 counts), MasteryMeter |

**21 component sets, ~80 variant components total.**

---

## Design rules enforced by the plugin

### Variables for everything
Every property that has a matching Variable is bound — no exceptions:

| Property | Variable collection | Example |
|---|---|---|
| Fill colour | 🌗 Semantic Color | `background`, `primary`, `muted-fg` |
| Stroke colour | 🌗 Semantic Color | `border`, `input`, `destructive` |
| Corner radius | 📐 Size | `radius/md`, `radius/full`, `radius/2xl` |
| Padding (top/bottom) | 📐 Size | `spacing/2`, `spacing/4` |
| Padding (left/right) | 📐 Size | `spacing/3`, `spacing/6` |
| Item spacing (gap) | 📐 Size | `spacing/1`, `spacing/2` |
| Font size | 📐 Size | `fontSize/sm`, `fontSize/base` |
| Font weight | 📐 Size | `fontWeight/medium`, `fontWeight/bold` |
| Palette aliases | 🎨 Global Palette | `primary/600`, `neutral/50` |

### Auto-layout everywhere
Every component frame uses auto-layout (not manual sizing). Padding and gap values come from `spacing/*` variables.

### Semantic Color = Light + Dark modes
Every fill that uses a Semantic Color variable (`background`, `primary`, `card`, etc.) automatically updates when you switch a frame's mode from **Light** to **Dark** — no local overrides.

---

## Verify: Light → Dark mode switch

1. Select any component (e.g. `Button/Variant=Primary, Size=MD`)
2. In the right panel → **Fill** → confirm it shows a Variable pill (not a hex value)
3. Select a parent frame set to **Light** mode
4. Change the mode to **Dark**
5. All component fills should update — if any stay the same, they have a detached value

---

## Component descriptions

Each ComponentSet has a description in the Figma sidebar that includes:
- Component purpose and key props/states
- Link to the corresponding Storybook story (`http://localhost:6006/?path=/story/...`)

After GitHub Pages is live (Phase 4), update the Storybook URL in `plugin/code.js` (search for `localhost:6006`) and re-run the plugin.

---

## Updating components

If you add or change a component in `@lingua/react`:

1. Update the relevant builder function in `packages/figma-plugin/plugin/code.js`
2. Clear the `⚛ Components` page in Figma (delete all children)
3. Re-run the plugin

For token value changes (spacing, colours, radius), you don't need to re-run the plugin — just run `pnpm --filter @lingua/tokens figma:push` and the Variable values update automatically (the component bindings stay intact).

---

## Troubleshooting

| Issue | Fix |
|---|---|
| "No Variables found" | Run Phase 5 first: `pnpm --filter @lingua/tokens figma:push` |
| Fills show hex instead of Variable | The Variable name doesn't match — check `plugin/code.js` variable name strings |
| Fonts fail to load | Ensure Inter is available in your Figma team library or installed locally |
| Component set has wrong variants | Delete the ComponentSet and re-run; check the `comp.name` format (`Variant=X, Size=Y`) |
| Mode switch doesn't change colour | Component fill uses a Global Palette var directly instead of a Semantic var — rebind via `applyFill(node, 'primary')` not `applyFill(node, 'primary/600')` |
