# Lingua Design System — Change Log

> This file is the living source of truth for what has been built, decisions made, and what comes next. It grows with every phase.

---

## Phase 1 — Monorepo Scaffold
**Branch:** `phase-1-scaffold`
**Date:** 2026-05-12
**Status:** ✅ Complete

### What was built

| Path | Description |
|---|---|
| `tokens/lingua-tokens.json` | Canonical token source in Tokens Studio format — global palette (primary indigo/purple, neutral, success, error, warning, category colors), spacing, border-radius, font-size, font-family, font-weight, line-height, shadow, and motion tokens. Light + dark semantic aliases included. |
| `packages/tokens/` | `@lingua/tokens` package stub. Phase 1 build script copies the JSON and emits CSS/JS/Tailwind/Figma stubs so downstream packages can depend on the package now. Full Style Dictionary pipeline lands in Phase 2. |
| `packages/react/` | `@lingua/react` package with tsup + TypeScript. Entry point (`src/index.ts`) is empty; components ship in Phase 3. Handoff files copied from `lingua-cards` into `src/handoff/` (excluded from build). |
| `packages/react/src/handoff/FlashcardFlipper.tsx` | Verbatim copy from `lingua-cards/src/components/FlashcardFlipper.tsx` — reference for Phase 3 port. |
| `packages/react/src/handoff/Study.tsx` | Verbatim copy from `lingua-cards/src/pages/Study.tsx` — reference for Phase 3 port. |
| `packages/react/src/handoff/DESIGN_HANDOVER.md` | Documents what changes during Phase 3 (path aliases, hardcoded hex → tokens, app hooks → props). |
| `packages/icons/` | `@lingua/icons` package. Copies SVG brand marks to `dist/` on build. |
| `packages/icons/src/lingua-logo-light.svg` | Light-mode logo (source: `lingua-cards/lingua-c1-light.svg`). |
| `packages/icons/src/lingua-logo-dark.svg` | Dark-mode logo (source: `lingua-cards/lingua-c1-dark.svg`). |
| `packages/icons/src/lingua-logo-hero.svg` | Favicon / hero mark (source: `lingua-cards/lingua-c1-favicon.svg`). |
| `apps/docs/` | `@lingua/docs` static site. Placeholder `index.html` + `ds-styles.css` (token CSS stubs). Build copies static files to `dist/`. |
| `.github/workflows/tokens.yml` | CI: rebuilds tokens on PRs touching `tokens/` or `packages/tokens/`. Git diff check (enabled in Phase 2). |
| `.github/workflows/docs.yml` | CI: builds and deploys docs to GitHub Pages on push to `main`. |
| `.changeset/config.json` | Changesets config. `@lingua/tokens`, `@lingua/react`, `@lingua/icons` are linked (same version bump). `@lingua/docs` is ignored from versioning. |
| `turbo.json` | Turborepo pipeline: `build` depends on upstream `^build`. |
| `pnpm-workspace.yaml` | Workspace globs `packages/*` and `apps/*`. |
| `README.md` | Root README explaining the token-first philosophy and migration phase tracker. |

### Build result
```
pnpm install  ✅  302 packages installed
pnpm build    ✅  4/4 tasks successful (tokens → icons → react → docs)
```

### Decisions made
- **Token format:** Tokens Studio JSON (global / light / dark three-set structure) — compatible with Style Dictionary v4 and with Tokens Studio Figma plugin.
- **Package names:** `@lingua/tokens`, `@lingua/react`, `@lingua/icons`, `@lingua/docs` (scoped to `@lingua`).
- **Handoff components placed in `src/handoff/`** and excluded from the build via `tsconfig.json` `exclude`. This avoids TypeScript errors from unresolved path aliases while keeping the reference code accessible.
- **`allowBuilds` in `pnpm-workspace.yaml`** set to `true` for `esbuild`, `style-dictionary`, `@bundled-es-modules/glob` (required by pnpm 11 security model).

### Open items / dependencies for Phase 2
- `tokens/lingua-tokens.json` was generated from the DESIGN_REVIEW.md design spec (indigo-600 primary, neutral grays, shadcn-ui semantic aliases). If the real Tokens Studio export from Figma becomes available, replace this file before Phase 2.
- `ds-tokens.jsx`, `ds-components.jsx`, `ds-sections.jsx`, `ds-app.jsx`, `Lingua Design System.html` from §0 of the migration plan were not available locally. They belong in `apps/docs/` and should be added when sourced from the design project.

---

## Phase 2 — Token Pipeline (Style Dictionary)
**Branch:** `phase-2-tokens`
**Date:** 2026-05-12
**Status:** ✅ Complete

### What was built

| Path | Description |
|---|---|
| `packages/tokens/build.mjs` | Full Style Dictionary v4 build script — replaces the Phase 1 stub entirely. Reads `tokens/lingua-tokens.json` and emits all 5 outputs. |
| `packages/tokens/transforms/shadow.mjs` | Custom SD transform `lingua/shadow-css`: converts `[{x,y,blur,spread,color}]` boxShadow arrays → single `box-shadow` CSS string. |
| `packages/tokens/dist/css/lingua.light.css` | `:root` block with 3 sections: semantic light vars (`--color-primary` etc.), global primitives (`--global-color-primary-50` etc.), category colours (`--cat-food` etc.). All references resolved to concrete hex values. |
| `packages/tokens/dist/css/lingua.dark.css` | `[data-theme="dark"]` block overriding the semantic vars for dark mode. |
| `packages/tokens/dist/js/tokens.{mjs,js,d.ts}` | Typed ES module + CJS export. Shape: `{ global, light, dark }` — each key maps token paths to `{ value, type, cssVar }`. Also exports `cssVars` convenience map. |
| `packages/tokens/dist/tailwind/lingua.tailwind.js` | Tailwind CSS preset: `theme.extend.{ colors, fontFamily, fontSize, spacing, borderRadius, boxShadow, fontWeight, lineHeight }` — all values derived from global tokens. |
| `packages/tokens/dist/figma/lingua-figma-tokens.json` | Full Tokens Studio JSON with all `{reference}` values resolved to concrete hex/string. Ready for Figma Variables import in Phase 5. |
| `apps/docs/index.html` | Upgraded to load `lingua.light.css` + `lingua.dark.css` from `@lingua/tokens`. Added live swatch grid (semantic + global palette), spacing scale display. |
| `apps/docs/ds-styles.css` | Stripped all hardcoded `:root` colour vars — now purely structural (layout, typography, component shells). All fills reference `--color-*` / `--global-color-*` vars from token CSS. |
| `apps/docs/scripts/build.mjs` | Now copies `packages/tokens/dist/css/*.css` and `packages/icons/dist/*.svg` into `apps/docs/dist/` before the static files. |
| `.gitignore` | Added `!packages/tokens/dist/` exception — token dist IS committed as a snapshot for the CI diff check. |
| `.github/workflows/tokens.yml` | Enabled `git diff --exit-code packages/tokens/dist` check — PRs that forget to rebuild fail CI. |

### Build result
```
pnpm tokens:build  ✅  5/5 outputs, zero warnings
pnpm build         ✅  4/4 packages successful
```

### Custom transforms registered
| Name | Type | Effect |
|---|---|---|
| `lingua/name-unique` | `name` | Full path → kebab slug — prevents SD collision warnings |
| `lingua/shadow-css` | `value` | boxShadow array → CSS `box-shadow` string |

### CSS variable naming convention
| Token set | Example path | CSS var |
|---|---|---|
| Semantic light/dark | `light.color.primaryFg` | `--color-primary-fg` |
| Global primitives | `global.color.primary.600` | `--global-color-primary-600` |
| Category colours | `global.color.category.food` | `--cat-food` |
| Spacing | `global.spacing.4` | `--global-spacing-4` |
| Shadow | `global.shadow.card` | `--global-shadow-card` |

### Decisions made
- **Style Dictionary v4 with custom formats** — using pure custom `lingua/*` formats instead of built-in `css/variables` gives full control over selectors, naming, and section grouping without fighting SD's defaults.
- **`packages/tokens/dist/` committed** — keeps the snapshot in the repo so CI can diff it. Other `dist/` folders remain gitignored.
- **`type: "module"` added to `packages/tokens/package.json`** — required for ESM `import` in `build.mjs`.
- **Shadow transform is lossless** — the `spread` value is included in the CSS string; Figma JSON keeps the original array structure.

---

## Phase 3 — React Component Library
**Branch:** `phase-3-react`
**Date:** 2026-05-12
**Status:** ✅ Complete

### What was built

**Tooling:**
| File | Purpose |
|---|---|
| `packages/react/.storybook/main.ts` | Storybook 8 config: react-vite builder, essentials + a11y addons |
| `packages/react/.storybook/preview.ts` | Imports token CSS, provides light/dark theme toolbar toggle |
| `packages/react/vitest.config.ts` | Vitest with jsdom + React Testing Library |
| `packages/react/src/test/setup.ts` | `@testing-library/jest-dom` global matchers |
| `packages/react/src/styles.css` | All component styles via CSS vars — zero hardcoded colours |
| `packages/react/src/lib/utils.ts` | `cn()` helper (clsx) |

**Components (21 total):**

| Group | Component | Stories | Tests |
|---|---|---|---|
| Primitives | Button | ✅ 9 stories | ✅ 4 tests |
| Primitives | Badge | ✅ 5 stories | — |
| Primitives | Pill | ✅ 2 stories | — |
| Primitives | Tag | ✅ 2 stories | — |
| Primitives | Avatar | ✅ 3 stories | — |
| Surfaces | Card + CardTitle + CardContent | ✅ 2 stories | — |
| Surfaces | Sheet | ✅ 1 story | — |
| Inputs | TextField | ✅ 3 stories | — |
| Inputs | Select | ✅ 1 story | — |
| Inputs | Checkbox | ✅ 3 stories | — |
| Inputs | RadioGroup | ✅ 1 story | — |
| Inputs | Switch | ✅ 2 stories | — |
| Feedback | ProgressBar | ✅ 6 stories | ✅ 3 tests |
| Feedback | Spinner | ✅ 3 stories | — |
| Feedback | Toast | ✅ 5 stories | — |
| Navigation | BottomNav | ✅ 1 story | — |
| Navigation | TopBar | ✅ 2 stories | — |
| Domain | Flashcard | ✅ 3 stories | ✅ 4 tests |
| Domain | CategoryChip | ✅ 1 story | — |
| Domain | StreakCounter | ✅ 3 stories | — |
| Domain | MasteryMeter | ✅ 3 stories | — |

**Screens:**
| Screen | File |
|---|---|
| Study Session | `src/screens/StudySession.stories.tsx` — full interactive study flow using only `@lingua/react` |

### Build result
```
pnpm build    ✅  4/4 packages successful, 0 TypeScript errors
pnpm test     ✅  11/11 tests pass (Button 4, ProgressBar 3, Flashcard 4)
pnpm storybook ✅  Storybook 8.6.18 starts in 645ms at localhost:6006
```

### Styling approach
- `src/styles.css` published as `@lingua/react/styles.css`
- All component colours reference `--color-*` and `--global-*` CSS vars from `@lingua/tokens`
- Zero hardcoded hex values in any component
- tsup entry includes `src/styles.css` so it's emitted to `dist/styles.css`

### Decisions made
- **CSS classes (`.lds-*` prefix)** over CSS-in-JS or Tailwind at the library level — keeps zero runtime overhead and lets consumers override via CSS
- **Swipe logic in Flashcard** — pointer events ported verbatim from handoff, now prop-driven (`onCorrect`/`onIncorrect` instead of tied to Supabase hooks)
- **`onSpeak` prop** on Flashcard — defaults to `speechSynthesis` but injectable for testing
- **Storybook `--ci` flag** — prevents browser auto-open in local dev; theme toolbar switches `document.documentElement.dataset.theme`

### Open items for Phase 3b / future
- Tests for all components (currently 3 files / 11 tests — critical paths covered)
- Storybook accessibility stories using `@storybook/addon-a11y`
- Changeset entry required before merge (per contributing guidelines)

---

## Phase 4 — Docs on GitHub Pages
**Branch:** `phase-4-docs`
**Date:** 2026-05-12
**Status:** ✅ Complete

### What was built

| Path | Description |
|---|---|
| `apps/docs/ds-styles.css` | Phase 4 comment header documenting the `@import "@lingua/tokens/css/lingua.light.css"` intent; added `.ds-quick-card`, `.ds-phase`, `.ds-components-page`, `.ds-explorer`, `.ds-token-card`, `.ds-type-*` and `.ds-component-*` styles. |
| `apps/docs/ds-components.jsx` | **Babel-in-browser component** — reads `window.LDS` (set by `tokens-export.js`). Renders: semantic palette, global palette, typography scale, spacing, shadows, component registry. Colour swatches are click-to-copy CSS var names. |
| `apps/docs/explorer.html` | Page hosting `ds-components.jsx` via `<script type="text/babel">`. Loads React + Babel + `tokens-export.js` from CDN/dist. Full nav + theme toggle. |
| `apps/docs/components/index.html` | Storybook iframe page. Probes `../storybook/index.html` with a `HEAD` request; loads the iframe if built, shows helpful fallback with local dev instructions if not. Propagates theme to Storybook via `postMessage`. |
| `apps/docs/index.html` | Updated: proper nav links to `/explorer.html` and `/components/`. Phase tracker section. Quick-link cards. Packages table. Inline `@import` comment in the CSS link block. |
| `apps/docs/scripts/build.mjs` | Phase 4 build: tokens CSS → icons → `tokens-export.js` (dynamic-imports `tokens.mjs`, writes `window.LDS`) → static docs → `components/` page → Storybook static copy (if built). |
| `apps/docs/package.json` | Added `"type": "module"` for ESM dynamic import in build script. |
| `.github/workflows/docs.yml` | Full pipeline: install → `pnpm tokens:build` → assert dist not stale → `pnpm build-storybook` → `pnpm --filter @lingua/docs build` → upload Pages artifact → deploy. Concurrency: one deploy per ref, cancel-in-progress. |
| `DECISIONS.md` | Answers to the six §3 decisions: visibility (private→public at v0.1), registry (GitHub Packages→npm at v1), Figma plan (Professional required for Phase 5), hosting (GitHub Pages), versioning (batched weekly), license (MIT). |

### Build result
```
pnpm build   ✅  4/4 packages successful
dist/        ✅  12 files — index.html, explorer.html, components/index.html,
                            lingua.light/dark.css, ds-styles.css, ds-components.jsx,
                            tokens-export.js (124 cssVar entries), 3 SVGs
Storybook    ℹ   Skipped locally; CI runs pnpm build-storybook before pnpm build
```

### Decisions made
- **`tokens-export.js`** — generates `window.LDS` via dynamic ESM import of `packages/tokens/dist/js/tokens.mjs`. This keeps the Babel showcase in sync with `@lingua/tokens` output automatically on every build.
- **Storybook iframe probe** — `components/index.html` uses `fetch(url, {method:'HEAD'})` to detect whether the Storybook build exists before rendering the iframe. Prevents a broken empty frame in local dev.
- **`ds-components.jsx` as "view source" artifact** — intentionally runs Babel-in-browser so developers can open DevTools, click "Sources", and read the raw JSX without any bundler step.
- **DECISIONS.md** — Locked the six §3 decisions so Phase 5+ agents don't have to ask.

---

## Phase 5 — Figma Variables Import
**Branch:** `phase-5-figma-import`
**Status:** ⏳ Pending

---

## Phase 6 — Figma Components
**Status:** ⏳ Pending

---

## Phase 7 — Two-way Sync
**Branch:** `phase-7-sync`
**Status:** ⏳ Pending

---

## Phase 8 — Connect Downstream Apps
**Branch:** `phase-8-consumers`
**Status:** ⏳ Pending
