# Contributing to Lingua Design System

This guide explains how to change a token, add a component, and get a PR merged. Read it once — it covers everything CI enforces.

---

## The golden rules

1. **To change a token: edit the JSON OR push from Figma; the PR auto-rebuilds.**
2. **To add a component: open a PR with a React component + Storybook story + Figma frame URL in the description.**
3. **All PRs that touch `packages/` require a Changeset entry.**

---

## Changing a design token

Tokens live in `tokens/lingua-tokens.json`. Every other artefact (CSS, JS, Tailwind, Figma Variables) regenerates from it.

### Path A — edit the JSON directly (developer)

```bash
# 1. Edit the source of truth
vim tokens/lingua-tokens.json

# 2. Rebuild all outputs
pnpm tokens:build

# 3. Commit both the JSON and the generated dist/
git add tokens/lingua-tokens.json packages/tokens/dist/
git commit -m "tokens: update primary-600 to #5254f0"

# 4. Open a PR — CI posts a diff table showing exactly what changed
```

### Path B — push from Figma (designer, Tokens Studio plugin)

1. Open the **Lingua DS** Figma file
2. Open the Tokens Studio plugin (Plugins → Development → Tokens Studio)
3. Edit the token value directly in the plugin panel
4. Click **Push to GitHub** → choose branch `design/token-<description>` → Create PR

CI picks up the PR automatically:
- Rebuilds `packages/tokens/dist/`
- Validates the diff is clean (`git diff --exit-code`)
- Posts a colour-swatch diff table as a PR comment

### What CI checks on token PRs

| Check | What it does |
|---|---|
| `pnpm tokens:build` | Regenerates CSS, JS, Tailwind, Figma JSON |
| `git diff --exit-code packages/tokens/dist` | Fails if the dist wasn't rebuilt |
| Token diff comment | Posts changed/added/removed token values with colour swatches |
| Changeset check | Requires a changeset entry for `@lingua/tokens` |

---

## Adding a React component

Every new component needs three things in one PR:

1. **React component** — in `packages/react/src/components/<Name>/`
   - `<Name>.tsx` — the component
   - `<Name>.stories.tsx` — Storybook stories for all variants (including a dark-mode story)
   - `<Name>.test.tsx` — at minimum: renders without crashing + ARIA attributes

2. **Storybook story** — must run without errors (`pnpm build-storybook` passes in CI)

3. **Figma frame URL** — paste the URL to the matching Figma component in the PR description:
   ```
   Figma: https://www.figma.com/file/<key>/Lingua-DS?node-id=...
   ```

### Component checklist

- [ ] No hardcoded colour values — all fills use `var(--color-*)` from `@lingua/tokens`
- [ ] Uses `.lds-*` CSS class names from `src/styles.css`
- [ ] Accessible: keyboard-navigable, correct `role`, `aria-*` attributes
- [ ] Stories cover: all variants, disabled state, dark mode
- [ ] Tests cover: render, keyboard interaction (if interactive), ARIA shape
- [ ] Component description in Figma sidebar links to Storybook story URL

```bash
# Scaffold commands
cd packages/react/src/components
mkdir MyComponent && cd MyComponent
touch MyComponent.tsx MyComponent.stories.tsx MyComponent.test.tsx
```

---

## Changeset entries (required for all package PRs)

Every PR that modifies `packages/tokens`, `packages/react`, or `packages/icons` must include a changeset entry. CI will **block the merge** if one is missing.

```bash
# In the repo root, run:
pnpm changeset

# Pick the affected package(s), the bump type (patch/minor/major), and write a summary.
# This creates a file in .changeset/ — commit it with your changes.
```

**Bump guide:**

| Change | Bump type |
|---|---|
| Token value tweaked, component bug fix | `patch` |
| New component, new token, new variant | `minor` |
| Breaking API change, token rename/removal | `major` |

---

## PR description template

```markdown
## Summary
<!-- What changed and why -->

## Type
- [ ] Token change
- [ ] New component
- [ ] Component update
- [ ] Bug fix
- [ ] Docs / CI

## Checklist
- [ ] `pnpm tokens:build` run and dist committed (token PRs)
- [ ] Storybook stories added/updated
- [ ] Tests pass (`pnpm test`)
- [ ] No hardcoded colour values
- [ ] Changeset entry included
- [ ] Figma frame URL in description (component PRs)

## Figma
<!-- Paste the Figma frame URL -->

## Storybook
<!-- Paste the Storybook story path -->
```

---

## Branch naming

| Type | Pattern | Example |
|---|---|---|
| Token change (from Figma) | `design/token-<desc>` | `design/token-primary-update` |
| New component | `feat/<component>` | `feat/tooltip` |
| Token change (developer) | `tokens/<desc>` | `tokens/adjust-radius` |
| Bug fix | `fix/<desc>` | `fix/button-disabled-opacity` |

---

## Release process (weekly batched)

Releases are batched weekly. On Monday:

```bash
# 1. Version bump (reads changeset entries)
pnpm changeset version

# 2. Review the generated CHANGELOG.md entries

# 3. Commit + push
git add . && git commit -m "chore: version packages"
git push

# 4. Publish (GitHub Packages)
pnpm changeset publish
```

See [DECISIONS.md](./DECISIONS.md) §5 for the full versioning policy.

---

## Getting help

- Open an issue or a discussion in the GitHub repo
- Tag `@lingua/ds-maintainers` in your PR for a review
- Read [DECISIONS.md](./DECISIONS.md) before proposing architectural changes
