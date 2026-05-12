# Lingua Design System

> **Tokens are the source of truth.** Edit `tokens/lingua-tokens.json`, run `pnpm build`, and everything regenerates — CSS variables, JS exports, a Tailwind preset, and a Figma-ready JSON all update automatically.

## Packages

| Package | Description |
|---|---|
| [`@lingua/tokens`](./packages/tokens) | Design tokens — Style Dictionary pipeline (Phase 2) |
| [`@lingua/react`](./packages/react) | React component library (Phase 3) |
| [`@lingua/icons`](./packages/icons) | Brand marks + SVG icons |
| [`@lingua/docs`](./apps/docs) | Documentation site → GitHub Pages |

## Quick start

```bash
# Install all workspace dependencies
pnpm install

# Build everything (tokens → icons → react → docs)
pnpm build

# Start Storybook (Phase 3+)
pnpm storybook

# Rebuild tokens only
pnpm tokens:build
```

## Monorepo structure

```
lingua-design-system/
├─ tokens/
│  └─ lingua-tokens.json        ← canonical token data (Tokens Studio format)
├─ packages/
│  ├─ tokens/                   ← Style Dictionary build (Phase 2)
│  ├─ react/                    ← component library (Phase 3)
│  └─ icons/                    ← brand SVGs
├─ apps/
│  └─ docs/                     ← documentation site (Phase 4 → GitHub Pages)
├─ .github/workflows/
│  ├─ tokens.yml                ← rebuild tokens on PR
│  └─ docs.yml                  ← deploy docs to Pages on push to main
└─ .changeset/                  ← versioning (Changesets)
```

## Token workflow

1. Edit `tokens/lingua-tokens.json` (or push from Figma via Tokens Studio — Phase 5).
2. Run `pnpm tokens:build`.
3. Commit the generated `packages/tokens/dist/` snapshot.
4. Open a PR — CI verifies the diff is clean.

## Migration phases

| Phase | Branch | Status |
|---|---|---|
| 1 — Monorepo scaffold | `phase-1-scaffold` | ✅ Done |
| 2 — Style Dictionary pipeline | `phase-2-tokens` | 🔜 Next |
| 3 — React component library | `phase-3-react` | ⏳ Pending |
| 4 — Docs on GitHub Pages | `phase-4-docs` | ⏳ Pending |
| 5 — Figma Variables import | `phase-5-figma-import` | ⏳ Pending |
| 6 — Rebuild components in Figma | — | ⏳ Pending |
| 7 — Two-way sync | `phase-7-sync` | ⏳ Pending |
| 8 — Connect downstream apps | `phase-8-consumers` | ⏳ Pending |

## Contributing

See `CONTRIBUTING.md` (added in Phase 7).

- To change a token: edit `tokens/lingua-tokens.json` OR push from Figma → PR auto-rebuilds.
- To add a component: open a PR with a React component + Storybook story + Figma frame URL in the description.
- All PRs touching `packages/react` or `packages/tokens` require a Changeset entry.
