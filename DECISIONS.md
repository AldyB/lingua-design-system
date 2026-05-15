# Lingua Design System — Architectural Decisions

> This file answers the six decisions from §3 of the Migration Plan so no agent or contributor has to guess.
> Update this file when a decision changes; add a "Superseded" note rather than deleting.

---

## 1. Repo Visibility

**Decision:** Start **private**, flip to **public** when v0.1.0 is tagged.

**Rationale:**
- GitHub Pages is free for both public and private repos (on Pro / Team plans).
- Private during build-out protects unfinished work.
- Public on release makes the Storybook URL shareable with designers and reviewers without auth.

**Action needed:** In GitHub repo settings → Pages, set source to "GitHub Actions" after pushing the first time.

---

## 2. Package Registry

**Decision:** **GitHub Packages** (`@lingua/*` scoped to the repo org), switching to **public npm** at v1.0.

### Phase 8 publish setup (active)

Publishing is automated via `.github/workflows/release.yml` (Changesets):

- Push to `main` with pending changesets → opens "Version Packages" PR
- Merge that PR → CI publishes new versions to GitHub Packages

Consumer app `.npmrc` (one-time setup):
```
@lingua:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}
```

The `release.yml` workflow uses `secrets.GITHUB_TOKEN` (no extra setup needed) since publishes are scoped to the same org as the repo.

**Rationale:**
- GitHub Packages is free for public packages and requires no extra setup for Renovate/Dependabot.
- The consumer app (`lingua-cards`) is already in the same GitHub org, so no extra auth needed.
- npm publish is reserved for when the DS is stable enough to be used by external teams.

**How to publish:**
```bash
# .npmrc in this repo
@lingua:registry=https://npm.pkg.github.com
//npm.pkg.github.com/:_authToken=${GITHUB_TOKEN}

# Release
pnpm changeset version
pnpm changeset publish
```

---

## 3. Figma Plan

**Decision:** **Figma Professional** plan required for Phase 5 + 6.

## 3b. Figma Sync Path (Phase 5 specific)

**Decision:** **Path B** (REST API Node script) implemented now; **Path A** (Tokens Studio plugin) set up manually alongside.

**Rationale:**
- Path B is fully automated and requires no Figma UI work. The script `figma-push.mjs` pushes all 103 variables in one command.
- Path A (Tokens Studio) is optional for Phase 5 but required for Phase 7 (two-way sync). Designers can set it up in parallel using `docs/figma-setup.md`.
- Phase 7 will add idempotency (GET → diff → UPDATE) so the script is safe to re-run.

**Rationale:** Figma Variables (used for design tokens) and Modes (light/dark) require Professional or above — they are not available on the Free tier. Tokens Studio plugin works on all plans, but its "Create Variables" action requires Professional.

**Blocker for Phase 5:** Confirm Figma plan before starting. If on Free, use Path B (Figma REST API script) instead of Path A (Tokens Studio plugin).

---

## 4. Storybook Hosting

**Decision:** **GitHub Pages** (this repo, same domain as the docs site).

**Rationale:**
- Free, zero additional accounts.
- Storybook is embedded in the docs via iframe at `docs-url/storybook/`.
- No visual-diff CI for now; that can be added as an opt-in Chromatic integration later.

**URL pattern:** `https://<org>.github.io/lingua-design-system/storybook/`

**Future:** Add Chromatic when the component count grows past ~40 and visual regression becomes a real risk.

---

## 5. Versioning Cadence

**Decision:** **Batched weekly releases** via Changesets, triggered manually.

**Rationale:**
- The DS is consumed by one internal app right now — continuous releases add noise.
- Weekly batch: every Monday, open a Changesets release PR; merge on approval.
- Automated on every merge to `main` once Phase 8 (consumer app) is live.

**Changeset workflow:**
```bash
# On every PR touching packages/tokens or packages/react:
pnpm changeset       # add a changeset entry
# CI enforces this via .changeset/config.json
```

---

## 6. License

**Decision:** **MIT**

**Rationale:** Lingua is an internal educational product. MIT is permissive, requires no legal review for open-sourcing, and is expected by the open-source ecosystem.

Add a `LICENSE` file before the first public release:
```
MIT License
Copyright (c) 2026 Lingua
```
