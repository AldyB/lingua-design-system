# Lingua Design System — Change Log

> This file is the living source of truth for what has been built, decisions made, and what comes next. It grows with every phase.

---

## Open items (waiting on CI)

**PR #1 — `chore/post-launch-cleanup`** (opened 2026-05-17)
- URL: https://github.com/AldyB/lingua-design-system/pull/1
- Removes the `figma-variables-payload.json` debug artifact + adds `.gitignore` entry
- **Waiting for CI** — `ci.yml`'s "Validate (tokens · build · test · changeset)" check should run on this PR
- The changeset check may flag this PR since it touches `packages/tokens/`; if so, run `pnpm changeset --empty` and push the entry
- Once green, merge as the first PR following the Phase 7 contribution flow

### Pages deployment fixes (already direct-pushed to main this session)
| Commit | Why direct-pushed (urgent: live site was broken) |
|---|---|
| `9aaeb0b` | `fix(ci): remove pnpm version from action-setup` |
| `90eae64` | `fix(ci): bump Node 20 → 22` (pnpm 11 needs `node:sqlite`) |
| `a7f72ce` | `fix(release): gate publishing on RELEASE_ENABLED` |
| `33e03fb` | `fix(docs): declare @lingua/icons dep` |
| `bc3b0be` | `fix(ci): use 'pnpm build' so @lingua/icons builds before docs` |

Live URL: https://aldyb.github.io/lingua-design-system/ — all 3 logos serving HTTP 200, overview + explorer + components iframe all reachable.

Going forward: all changes go through PRs (PR #1 is the first to follow that pattern).

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
**Date:** 2026-05-12
**Status:** ✅ Complete

### What was built

| Path | Description |
|---|---|
| `packages/tokens/scripts/figma-push.mjs` | **Path B — REST API script.** Reads `tokens/lingua-tokens.json`, builds the full Figma Variables POST payload (5 collections, 6 modes, 103 variables, 120 values), and calls `POST /v1/files/:key/variables`. Supports `--dry-run` and `--save-payload`. |
| `packages/tokens/package.json` | Added `figma:push`, `figma:dry-run`, `figma:payload` scripts. |
| `.github/workflows/figma-sync.yml` | CI workflow: triggers on push to `main` when `tokens/lingua-tokens.json` changes. Runs dry-run always; runs live push only when `FIGMA_FILE_KEY` + `FIGMA_ACCESS_TOKEN` secrets are set and `FIGMA_SYNC_ENABLED=true`. |
| `docs/figma-setup.md` | Full setup guide for Path A (Tokens Studio plugin) and Path B (REST API script). Includes troubleshooting, acceptance criteria, and Phase 7 two-way sync prerequisites. |
| `DECISIONS.md` | Added §3b — Path B chosen for Phase 5; Path A required for Phase 7 two-way sync. |

### Payload verified (dry run)
```
Collections : 5
Modes       : 6
Variables   : 103  (39 palette + 17 semantic + 36 size + 8 motion + 3 type)
Values      : 120  (34 VARIABLE_ALIAS + 39 COLOR + 40 FLOAT + 7 STRING)
```

### Variable collection structure
| Collection | Mode(s) | Count | Type |
|---|---|---|---|
| 🎨 Lingua / Global Palette | Global | 39 | COLOR (raw hex → {r,g,b,a}) |
| 🌗 Lingua / Semantic Color | Light + Dark | 17 | COLOR (VARIABLE_ALIAS → palette) |
| 📐 Lingua / Size | Default | 36 | FLOAT (px stripped) |
| ✨ Lingua / Motion | Default | 8 | FLOAT (ms) + STRING (easing) |
| 🔤 Lingua / Typography | Default | 3 | STRING (first font in stack) |

### Decisions made
- **Path B** implemented now (REST API, fully automated)
- **Path A** (Tokens Studio plugin) is the Phase 7 prerequisite — documented in `docs/figma-setup.md`
- Script is **not yet idempotent** — running twice creates duplicates. Phase 7 will add GET→diff→UPDATE.
- **Shadow tokens excluded** — Figma has no native shadow variable type; they ship as CSS strings in `lingua.light.css`.
- **Font family** — only the first font in the comma-separated stack is pushed to Figma STRING variable.

### To activate live sync
1. Set GitHub Secrets: `FIGMA_FILE_KEY`, `FIGMA_ACCESS_TOKEN`
2. Set GitHub Variable: `FIGMA_SYNC_ENABLED=true`
3. Trigger `figma-sync.yml` manually from the Actions tab for first push to a fresh Figma file

---

## Phase 6 — Figma Components
**Branch:** `phase-6-figma-components`
**Date:** 2026-05-12
**Status:** ✅ Complete

### What was built

| Path | Description |
|---|---|
| `packages/figma-plugin/manifest.json` | Figma plugin manifest — install via Plugins → Development → Import from manifest |
| `packages/figma-plugin/plugin/ui.html` | Plugin UI panel: progress log + "Build all components" button |
| `packages/figma-plugin/plugin/code.js` | Plugin main thread: creates all 21 components as ComponentSets using Phase 5 Variables. ~600 lines. |
| `docs/figma-components.md` | Setup guide: install plugin, run it, verify light/dark switching, troubleshoot |

### Components built by the plugin

| Group | Components | Variants |
|---|---|---|
| Primitives | Button, Badge, Pill, Tag, Avatar | 15 + 5 + 1 + 2 + 3 = 26 |
| Surfaces | Card, Sheet | 2 + 1 = 3 |
| Inputs | TextField, Select, Checkbox, RadioGroup, Switch | 3+1+3+1+2 = 10 |
| Feedback | ProgressBar, Spinner, Toast | 3+3+4 = 10 |
| Navigation | BottomNav, TopBar | 1+1 = 2 |
| Domain | Flashcard, CategoryChip, StreakCounter, MasteryMeter | 3+8+3+1 = 15 |

**Total: 21 component sets, ~80 variant components**

### Design rules enforced
- Every fill/stroke → Semantic Color variable (not palette or hex)
- Every corner radius → Size `radius/*` variable
- Every padding/gap → Size `spacing/*` variable
- Every font size → Size `fontSize/*` variable
- Auto-layout on all components
- Storybook story URL in every component description

### Variable binding
- Fills use `applyFill(node, 'primary')` → binds to 🌗 Semantic Color `primary`
- Palette colours only used for CategoryChip dot fills (where category-specific colour is needed)
- Switching a frame Light→Dark updates all fills via variable aliases (no local overrides)

### How to run
```bash
# In Figma file with Phase 5 Variables:
# Plugins → Development → Import from manifest → packages/figma-plugin/manifest.json
# Then: Plugins → Development → Lingua DS — Component Builder → ⚡ Build all components
```

---

## Phase 7 — Two-way Sync + Contribution Flow
**Branch:** `phase-7-sync`
**Date:** 2026-05-12
**Status:** ✅ Complete

### What was built

| Path | Description |
|---|---|
| `packages/tokens/scripts/figma-push.mjs` | **`--update` flag**: fetches existing Figma Variables via `GET /v1/files/:key/variables/local`, builds col/mode/var lookup tables, then `resolvePayloadIds()` replaces temp IDs with real Figma IDs and converts `CREATE` → `UPDATE` for existing entities. Safe to re-run on any push. |
| `packages/tokens/scripts/token-diff.mjs` | Flattens two token JSON files and computes added/changed/removed token values. Outputs a Markdown table with colour swatches. Called by `token-pr.yml`. |
| `packages/tokens/package.json` | Added `figma:update` and `token-diff` scripts. |
| `.github/workflows/figma-sync.yml` | Updated to use `figma:update` (idempotent `--update` flag). |
| `.github/workflows/ci.yml` | **New** — PR validation pipeline: `tokens:build` → dist stale check → `pnpm build` → `pnpm test` → `build-storybook` → changeset check → Storybook artifact upload (7-day retention). |
| `.github/workflows/token-pr.yml` | **New** — Token PR review: triggers on any PR touching `tokens/lingua-tokens.json`. Saves base version, runs `pnpm tokens:build`, calls `token-diff.mjs`, posts (or updates) a colour-swatch diff table as a PR comment. |
| `CONTRIBUTING.md` | Full contribution guide: token change (Path A + B), adding a component (checklist), changeset rules, PR template, branch naming, weekly release process. |
| `docs/branch-protection.md` | `gh api` commands to lock `main` with required status checks. Covers `design/*` branch protection for Tokens Studio PRs. Full two-way loop description. |

### Two-way sync loop (complete)
```
Figma token edit
  → Tokens Studio push → PR on design/token-*
  → token-pr.yml: colour-swatch diff comment
  → ci.yml: build + tests + changeset check
  → Merge → main
  → docs.yml: deploy docs + Storybook
  → figma-sync.yml: idempotent push back to Figma (--update)
```
Target: < 5 minutes from Figma edit to live on GitHub Pages.

### Idempotency (--update flag)
`resolvePayloadIds()` post-processes the payload:
- Fetches `GET /variables/local` → builds `colByName` + `varByKey` maps
- Replaces temp IDs with real Figma IDs
- Sets `action: 'UPDATE'` for existing entities (collections, modes, variables, values)
- `VARIABLE_ALIAS` targets also resolved to real IDs
- New entities stay `action: 'CREATE'` with temp IDs

### What CI requires on every PR (branch protection)
1. `pnpm tokens:build` passes
2. `git diff --exit-code packages/tokens/dist` — dist must be committed
3. `pnpm build` (all packages)
4. `pnpm test` (packages/react, 11 tests)
5. `pnpm build-storybook` (no broken imports)
6. Changeset entry present (if packages/ touched)

---

## Phase 8 — Connect Downstream Apps
**Branch:** `phase-8-consumers`
**Date:** 2026-05-15
**Status:** ✅ Complete (consumer-side migration is opt-in, run by the app owner)

### What was built

| Path | Description |
|---|---|
| `packages/tokens/transforms/shadcn.mjs` | `hexToHslTriplet()` + `SHADCN_NAME_MAP` (semantic→shadcn naming) + `SHADCN_ALIASES` (popover→card etc.). Maps our `--color-primary: #4f46e5` to shadcn's `--primary: 243 75% 59%`. |
| `packages/tokens/build.mjs` | `buildShadcnShim(raw)` emits `dist/css/lingua.shadcn.css` — drop-in for shadcn/ui consumer apps (lingua-cards uses this naming). |
| `packages/tokens/package.json` | New export: `"./css/lingua.shadcn.css": "./dist/css/lingua.shadcn.css"` |
| `.github/dependabot.yml` | Weekly bumps for the DS monorepo's own deps (turbo, storybook, vitest, react, GH Actions). Grouped to limit PR noise. |
| `.github/workflows/release.yml` | Changesets publish workflow → GitHub Packages. Opens "Version Packages" PR on push to main; publishes when merged. |
| `docs/consumer-migration.md` | Full migration guide for lingua-cards: 3 paths (shadcn shim, direct import, Tailwind preset only); component swap table; verification test for "zero app-code change" acceptance. |
| `docs/dependabot-template.yml` | Drop-in `.github/dependabot.yml` for consumer apps — groups all `@lingua/*` into one weekly PR. |
| `DECISIONS.md` | §2 expanded with Phase 8 publish setup (registry config, .npmrc, GITHUB_TOKEN). |

### Key insight: shadcn/ui shim
lingua-cards uses shadcn/ui CSS vars (`--primary` in HSL triplet space) — incompatible with `@lingua/tokens` (`--color-primary` in hex). The `lingua.shadcn.css` shim bridges the two:
- Translates `light.color.primary` → `--primary`
- Converts hex → HSL triplet (243 75% 59%)
- Uses `.dark` selector (shadcn) instead of `[data-theme="dark"]`

Result: lingua-cards replaces ~50 lines of hand-written CSS vars with one `@import` line. Token bumps propagate without touching app code.

### Consumer migration (manual — to be run by lingua-cards owner)

Documented in `docs/consumer-migration.md`. Three paths supported:
1. **Path A — shadcn shim** (recommended for lingua-cards)
2. **Path B — Direct `@lingua/tokens` CSS import** (fresh apps using DS naming)
3. **Path C — Tailwind preset only** (apps without CSS vars)

### Acceptance test (manual)
1. Edit `tokens/lingua-tokens.json` → change a primary colour
2. Run `pnpm tokens:build`
3. Refresh consumer app → colour changes everywhere
4. **App code untouched** ✓
