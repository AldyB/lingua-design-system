# Lingua Design System — Migration Plan
**Goal:** Establish the Lingua DS in **two homes** kept in sync from one source of truth.

- **GitHub** = canonical source. Tokens + components + docs live here. Agents code against it.
- **Figma** = visual mirror. Designers (and design agents) compose screens against it.
- **A token pipeline** keeps colors / type / spacing / radius / shadow / motion identical on both sides.

> Hand this whole file to Claude (or any coding agent). Each Phase is independently executable. Stop after each phase, review, then continue.

---

## 0. Inputs (already in this project)

| File | Role |
|---|---|
| `lingua-tokens.json` | Tokens Studio export (global / light / dark) — **canonical token data** |
| `ds-tokens.jsx` | Same tokens annotated with `use:` notes — **canonical documentation copy** |
| `ds-styles.css` | CSS variable bindings, motion, primitives |
| `ds-components.jsx`, `ds-sections.jsx`, `ds-app.jsx` | Live docs page (React/Babel) |
| `Lingua Design System.html` | Rendered docs entry point |
| `Lingua Design System (standalone).html` | Offline, single-file version of the docs |
| `lingua-logo-light.svg`, `lingua-logo-dark.svg`, `lingua-logo-hero.svg` | Brand marks |
| `Card Detail View.html`, `Study Session.html` | Sample screens |
| `handoff/FlashcardFlipper.tsx`, `handoff/Study.tsx`, `handoff/DESIGN_HANDOVER.md` | Production-grade component examples |

---

## 1. Outcomes

When done you will have:

1. A public or private **GitHub repo** `lingua-design-system` containing:
   - `tokens/` — source-of-truth JSON
   - `packages/tokens` — built CSS / JS / TS / Tailwind / Figma-Tokens outputs
   - `packages/react` — React component library (compiled from the JSX prototypes)
   - `apps/docs` — the existing HTML docs, hosted on GitHub Pages
   - CI that rebuilds tokens + docs on every push
2. A **Figma file** `Lingua DS` containing:
   - Color, type, spacing, radius, shadow as **Figma Variables** (light + dark modes)
   - A page of **Components** matching the React library 1:1 (Button, Card, Pill, Badge, Bottom Nav, Flashcard, Progress, Input)
   - A page of **Patterns / Screens** (Card Detail, Study Session) using those components
3. A **two-way sync** so changing a token in either place propagates to the other within one PR.

---

## 2. Phases (sequential, but each PR-sized)

### Phase 1 — Set up the GitHub monorepo
**Branch:** `phase-1-scaffold`

1. Create repo `lingua-design-system` (private to start). Init with `pnpm` + `turborepo`.
2. Folder layout:
   ```
   lingua-design-system/
   ├─ tokens/
   │  └─ lingua-tokens.json        ← copy as-is from this project
   ├─ packages/
   │  ├─ tokens/                   ← Style Dictionary build
   │  ├─ react/                    ← component lib (Vite + tsup + Storybook)
   │  └─ icons/                    ← logo + any future SVG icons
   ├─ apps/
   │  └─ docs/                     ← existing HTML docs, repointed at /packages/tokens/dist
   ├─ .github/workflows/
   │  ├─ tokens.yml                ← rebuild tokens on PR
   │  └─ docs.yml                  ← deploy docs to Pages
   ├─ .changeset/                  ← versioning
   └─ README.md
   ```
3. Copy from this Claude project into the repo:
   - `lingua-tokens.json` → `tokens/lingua-tokens.json`
   - `ds-styles.css` → `apps/docs/ds-styles.css`
   - `ds-*.jsx`, `Lingua Design System.html` → `apps/docs/`
   - `lingua-logo-*.svg` → `packages/icons/src/`
   - `handoff/FlashcardFlipper.tsx`, `handoff/Study.tsx` → `packages/react/src/components/` (will be cleaned up in Phase 3)
4. Root `README.md` should explain: "Tokens are the source of truth. Edit JSON, run `pnpm build`, everything else regenerates."

**Acceptance:** repo builds, `pnpm install && pnpm build` succeeds, docs site renders locally.

---

### Phase 2 — Build the token pipeline (Style Dictionary)
**Branch:** `phase-2-tokens`

Use **Style Dictionary** because it speaks both directions: in from Tokens Studio JSON, out to CSS/JS/TS/Tailwind/Figma. Tokens Studio's JSON shape is already what we have.

1. In `packages/tokens/`:
   ```
   packages/tokens/
   ├─ src/lingua-tokens.json       ← symlink or copy from /tokens
   ├─ config.cjs                   ← Style Dictionary config (3 platforms)
   ├─ transforms/                  ← custom shadow-array → CSS string transform
   └─ dist/                        ← generated (gitignored except for snapshots)
   ```
2. Output platforms:
   - `dist/css/lingua.light.css` + `lingua.dark.css` — `:root { --color-primary: ... }` (replaces the current hand-written CSS variable block in `ds-styles.css`)
   - `dist/js/tokens.js` + `tokens.d.ts` — typed JS export, used by `@lingua/react`
   - `dist/tailwind/lingua.tailwind.js` — Tailwind preset (color scales, spacing, radius, shadow, fontSize, fontFamily)
   - `dist/figma/lingua-figma-tokens.json` — Tokens Studio shape (round-trip target for Figma)
3. Custom transforms needed:
   - **Shadow**: the JSON stores shadows as `[{x,y,blur,spread,color}]`. Emit them as a single `box-shadow` CSS string and as a structured array for JS.
   - **Category colors**: emit a `--cat-{name}` CSS var for each.
   - **Light/dark**: light goes on `:root`, dark on `[data-theme="dark"]`.
4. Add a CI check: `pnpm tokens:build && git diff --exit-code packages/tokens/dist` fails the PR if the build wasn't run.

**Acceptance:** changing one value in `tokens/lingua-tokens.json` and running `pnpm tokens:build` updates CSS, JS, Tailwind, and Figma exports identically. The existing docs page still renders correctly using the new CSS output.

---

### Phase 3 — Productionize the React component library
**Branch:** `phase-3-react`

The current `ds-components.jsx` is Babel-in-browser. We need a real npm package.

1. In `packages/react/`, set up Vite + tsup + Storybook + Vitest. Target: `react@18+`, ESM only, TypeScript.
2. Port these components from `ds-components.jsx` / `ds-sections.jsx` / `handoff/*.tsx` (one PR per component group is fine):
   - **Primitives:** Button (variants: primary, secondary, ghost, destructive; sizes: sm, md, lg), Pill, Badge, Tag, Avatar
   - **Surfaces:** Card, Popover, Sheet
   - **Inputs:** TextField, Select, Checkbox, RadioGroup, Switch
   - **Feedback:** ProgressBar, Spinner, Toast
   - **Navigation:** BottomNav, TopBar
   - **Domain components:** Flashcard (port `FlashcardFlipper.tsx`), CategoryChip, StreakCounter, MasteryMeter
3. Each component:
   - Reads tokens from `@lingua/tokens` — **no hardcoded hex anywhere**
   - Ships with `*.stories.tsx` and `*.test.tsx`
   - Has an `aria-*` story
4. Set up **Changesets** so every PR that touches `packages/react` requires a version bump entry.

**Acceptance:** `pnpm storybook` shows every component in both light and dark mode. The two sample screens (`Card Detail View`, `Study Session`) can be rebuilt in a Storybook example using only `@lingua/react` + `@lingua/tokens`.

---

### Phase 4 — Migrate the docs site to GitHub Pages
**Branch:** `phase-4-docs`

1. Replace the hand-written CSS variable block at the top of `apps/docs/ds-styles.css` with `@import "@lingua/tokens/css/lingua.light.css"` (and dark).
2. Keep `ds-components.jsx` as the live, Babel-in-browser version for the docs — it's a good "view source in browser" artifact. But repoint it at `window.LDS` from the new generated JS instead of the hand-written one.
3. Add a `apps/docs/components/` page that **iframes the Storybook build** so the docs and the published Storybook stay aligned.
4. `.github/workflows/docs.yml`: on push to `main`, build tokens → build Storybook → copy docs HTML → deploy to GitHub Pages.

**Acceptance:** `https://<org>.github.io/lingua-design-system/` shows the docs, and every token / component card matches what `@lingua/react` actually exports.

---

### Phase 5 — Stand up the Figma file
**Branch (in repo):** `phase-5-figma-import`

This is the half-manual phase. Two paths — pick **A** unless you object.

**Path A (recommended): Tokens Studio plugin + GitHub sync**

1. In Figma, create a new file `Lingua DS`. Install the **Tokens Studio for Figma** plugin (free tier).
2. In the plugin, connect to GitHub:
   - Repo: `lingua-design-system`
   - File path: `packages/tokens/dist/figma/lingua-figma-tokens.json` (output of Phase 2)
   - Branch: `main`
3. Click **Pull** — the plugin imports all tokens. Then click **Create variables** to project them into Figma's native Variables (one collection per theme: Light, Dark; one mode per theme).
4. Wire token sets to Figma Modes: `global` always on; `light` for Light mode; `dark` for Dark mode. Categories, spacing, radius, fontSize, shadow all get their own Variable groups.
5. Set up the plugin's **Push** action so designers can edit a token in Figma → push a branch + PR to the repo.

**Path B (fallback): one-shot CSV/JSON import via Figma Variables REST API**

If you don't want a plugin, write a Node script in `packages/tokens/scripts/figma-push.ts` that reads `dist/figma/lingua-figma-tokens.json` and POSTs to `https://api.figma.com/v1/files/:file_key/variables` using a Figma access token in a GitHub secret. Run it from CI on push. One-way only (repo → Figma).

**Acceptance:** every variable in Figma's Variables panel has an exact 1:1 counterpart in `tokens/lingua-tokens.json`. Switching a frame between Light and Dark modes in Figma works without any local overrides.

---

### Phase 6 — Rebuild components in Figma
**Estimated:** 1–2 designer-days; do alongside Phase 5.

For each component shipped in `@lingua/react` (Phase 3), create the Figma equivalent with variants matching the React props:

- Button: variants × sizes × states (default, hover, pressed, disabled, loading)
- Card: surface, padded, interactive (3 variants)
- Pill, Badge, Tag, Avatar
- Input, Select, Checkbox, RadioGroup, Switch
- ProgressBar, Toast
- BottomNav, TopBar
- Flashcard (front / back / flipping intermediate)

Rules:

- **Use Variables for every fill, stroke, text style, corner radius, gap.** No raw hex. No detached values.
- **Auto-layout everywhere.** Padding values must come from the spacing Variables, not typed numbers.
- Each component description in the Figma sidebar links to its Storybook story URL.

**Acceptance:** drop a Light-mode frame onto a Dark-mode page → everything reskins correctly because nothing is hardcoded.

---

### Phase 7 — Two-way sync + contribution flow
**Branch:** `phase-7-sync`

1. **Code → Figma:** any merge to `main` runs Tokens Studio push (Path A) or Figma REST script (Path B). Result is a non-destructive update to Variables.
2. **Figma → Code:** designer opens Tokens Studio plugin, edits tokens, clicks **Push to GitHub** → opens PR with diff in `tokens/lingua-tokens.json`. CI runs `pnpm tokens:build`, regenerates everything, posts a visual-diff comment from Storybook + Pages preview.
3. Add `CONTRIBUTING.md`:
   - "To change a token: edit JSON OR push from Figma; PR auto-rebuilds."
   - "To add a component: open PR with React component + Storybook story + Figma frame URL in the description."
   - "All PRs require a Changeset entry."
4. Add **branch protection** on `main` requiring: token build green, Storybook build green, Changeset present.

**Acceptance:** edit a color in Figma → 5 minutes later it's a PR in the repo with the right diff and a visual regression preview.

---

### Phase 8 — Connect downstream apps
**Branch:** `phase-8-consumers`

For the actual Lingua app (the one `handoff/Study.tsx` came from):

1. Replace its local CSS variable block with `@lingua/tokens` as an npm dep (publish to GitHub Packages or npm — see "Decisions" below).
2. Replace its local components with `@lingua/react`.
3. Add a `lingua-design-system` version pin in its `package.json` and a Renovate/Dependabot config to bump it weekly.

**Acceptance:** the app builds against published versions. Bumping `@lingua/tokens` patches in a new color across the app with zero app-code changes.

---

## 3. Decisions to make before kicking off

Answer these in the GitHub repo's `DECISIONS.md` so the agent doesn't guess:

1. **Repo visibility:** private or public?
2. **Package registry:** GitHub Packages (free, scoped to org) or public npm under `@lingua/*`?
3. **Figma plan:** does your team have Figma Professional+? (Variables + Modes require it. Free tier won't work for Phase 5.)
4. **Storybook hosting:** GitHub Pages (free, public) or Chromatic (visual diffs, paid)?
5. **Versioning cadence:** continuous (every merge ships) or batched (weekly release PR)?
6. **License:** MIT, Apache-2.0, or proprietary?

---

## 4. Suggested execution order with an agent

Hand the agent this file and one phase at a time. Recommended sequence:

1. Phase 1 (scaffold) — 1 session
2. Phase 2 (tokens pipeline) — 1 session
3. Phase 4 (docs on Pages) — short, do early so you have a live URL to share
4. Phase 3 (React lib) — multiple sessions, one component group at a time
5. Phase 5 (Figma import) — manual, done by you while agent works on Phase 3
6. Phase 6 (Figma components) — manual, parallel with Phase 3
7. Phase 7 (sync) — once both sides exist
8. Phase 8 (consumer apps) — once v0.1.0 of the package is published

---

## 5. First message to send the agent

Paste this verbatim after attaching the relevant files / repo:

> Read `Lingua DS — Migration Plan.md`. Execute **Phase 1** only. Create the monorepo scaffold, copy files from the source project as listed in §0, and make `pnpm install && pnpm build` succeed. Open a draft PR titled `phase-1-scaffold` and stop. Do not start Phase 2.

Repeat with `Phase 2`, `Phase 3`, etc. each time.
