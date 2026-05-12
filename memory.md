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
**Status:** 🔜 Next

_To be filled in after Phase 2 is executed._

---

## Phase 3 — React Component Library
**Branch:** `phase-3-react`
**Status:** ⏳ Pending

_To be filled in after Phase 3 is executed._

---

## Phase 4 — Docs on GitHub Pages
**Branch:** `phase-4-docs`
**Status:** ⏳ Pending

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
