# Phase 5 — Figma Variables Setup

This guide covers both sync paths. **Path B** (REST API script) is already implemented and ready to run. **Path A** (Tokens Studio plugin) gives designers a push-from-Figma superpower in Phase 7.

---

## Prerequisites

- **Figma Professional plan** (Variables + Modes require it — Free tier won't work)
- A **Personal Access Token** from Figma: Settings → Account → Personal access tokens → Create
- The **Figma file key**: open your Figma file, copy the key from the URL  
  `https://www.figma.com/design/**<FILE_KEY>**/Lingua-DS`

---

## Path B — REST API script (recommended for automation)

This is fully automated. One command pushes all 103 variables into Figma.

### 1. Test with dry run (no Figma account needed)

```bash
pnpm --filter @lingua/tokens figma:dry-run
```

Prints the payload summary without calling the API. Run this first to verify the script.

### 2. Push to Figma (one-time setup or after token changes)

```bash
FIGMA_FILE_KEY=<your-file-key> \
FIGMA_ACCESS_TOKEN=<your-personal-access-token> \
pnpm --filter @lingua/tokens figma:push
```

### 3. Set up GitHub Actions for automatic sync

Add these two repository secrets (Settings → Secrets → Actions):

| Secret name           | Value |
|-----------------------|-------|
| `FIGMA_FILE_KEY`      | Your Figma file key (from the URL) |
| `FIGMA_ACCESS_TOKEN`  | Your Figma Personal Access Token |

Then set the repository variable `FIGMA_SYNC_ENABLED` to `true`  
(Settings → Variables → Actions → New variable).

After that, every push to `main` that changes `tokens/lingua-tokens.json` will automatically push updated variables to Figma.

### 4. What gets created in Figma

| Collection | Mode(s) | Variables | Type |
|---|---|---|---|
| 🎨 Lingua / Global Palette | Global | 39 | COLOR |
| 🌗 Lingua / Semantic Color | Light + Dark | 17 × 2 modes | COLOR (aliases) |
| 📐 Lingua / Size | Default | 36 | FLOAT |
| ✨ Lingua / Motion | Default | 8 | FLOAT + STRING |
| 🔤 Lingua / Typography | Default | 3 | STRING |

**Semantic Color variables are aliases** — e.g. `background` in Light mode aliases `neutral/50`; in Dark mode aliases `neutral/950`. Switching a frame's mode in Figma updates all colours automatically with no local overrides.

### 5. Known limitations (Phase 5)

- **Not idempotent**: running the script twice on the same Figma file creates duplicate variables. Clear the Variables panel (or use a fresh file) before re-running. Phase 7 will add a GET→diff→UPDATE cycle.
- **Shadow tokens are excluded**: Figma has no native shadow variable type. Shadows ship as CSS strings in `dist/css/lingua.light.css`.
- **Font family**: only the first font in the stack is pushed (e.g. `ui-sans-serif` for `sans`).

---

## Path A — Tokens Studio plugin (manual, enables Phase 7 two-way sync)

Path A gives designers the ability to **push token changes from Figma back to GitHub** (Phase 7). Set it up after running Path B.

### Step 1 — Create the Figma file

1. In Figma, click **New design file**
2. Rename it `Lingua DS`
3. Note the file key from the URL

### Step 2 — Install Tokens Studio

In the Figma file:
1. Resources (⌘/) → Plugins → Browse plugins
2. Search **Tokens Studio for Figma** → Install (free tier works for import)
3. Open the plugin: Main menu → Plugins → Tokens Studio

### Step 3 — Connect to GitHub

In the Tokens Studio plugin:
1. Settings tab → Sync providers → Add new → **GitHub**
2. Fill in:
   - **Repository**: `<your-github-org>/lingua-design-system`
   - **Branch**: `main`
   - **File path**: `packages/tokens/dist/figma/lingua-figma-tokens.json`
   - **Token**: your GitHub Personal Access Token (needs `repo` scope)
3. Save

### Step 4 — Pull and apply tokens

1. In the plugin: **Pull** → confirm to load all token sets
2. You should see three sets: `global`, `light`, `dark`
3. Enable all sets (toggle them on)
4. Click **Create Variables** (requires Figma Professional)
5. In the dialog: create one collection per theme — Light and Dark modes

### Step 5 — Wire Figma Modes

After creating variables:
1. Open the Variables panel (Resources → Local variables)
2. In the Semantic Color collection:
   - Light mode → uses `light` token set
   - Dark mode → uses `dark` token set
3. The `global` set is always-on (provides the palette the semantic vars alias into)

### Step 6 — Verify

Select any frame → Change its mode between Light and Dark.  
All fills should update with no local overrides. If any frame element stays the same colour, it has a hardcoded fill — find and replace with a variable.

### Step 7 — Enable Push (for Phase 7)

Once the DS is stable:
1. In the Tokens Studio plugin: Settings → Git → Push
2. Configure the push branch (e.g. `design/tokens-update`)
3. Designers can now: edit a token → push → creates a PR in GitHub → CI rebuilds everything

---

## Acceptance criteria (Phase 5)

- [ ] Every variable in Figma's Variables panel has a 1:1 counterpart in `tokens/lingua-tokens.json`
- [ ] Switching a frame between Light and Dark modes works with no local overrides
- [ ] `pnpm --filter @lingua/tokens figma:dry-run` completes with 103 variables, 0 errors
- [ ] (Path B) `figma-sync.yml` workflow runs dry-run on every token push

---

## Troubleshooting

| Error | Fix |
|---|---|
| `403 Forbidden` from Figma API | Check your `FIGMA_ACCESS_TOKEN`. Ensure your Figma plan is Professional. |
| `404 Not Found` | Verify `FIGMA_FILE_KEY` — it's the segment between `/design/` and `/` in the Figma URL. |
| Duplicate variables after re-run | Clear variables in Figma (Variables panel → ⋯ → Delete all) before re-running. |
| Tokens Studio: "Cannot create variables" | Your Figma plan is Free. Variables require Professional or above. |
| Missing dark mode values | Ensure both Light and Dark token sets are enabled in Tokens Studio. |
