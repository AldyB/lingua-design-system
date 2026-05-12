# Branch Protection Setup

Run these `gh` commands once after the repo is created and the first CI workflow has run successfully. They lock `main` so no PR can merge without passing all required checks.

```bash
# ── Required: repo must exist on GitHub and CI must have run at least once ──
# (GitHub needs to have seen the check names before you can require them)

OWNER="<your-github-username-or-org>"
REPO="lingua-design-system"

gh api "repos/$OWNER/$REPO/branches/main/protection" \
  --method PUT \
  --header "Accept: application/vnd.github+json" \
  --field "required_status_checks[strict]=true" \
  --field "required_status_checks[contexts][]=Validate (tokens · build · test · changeset)" \
  --field "enforce_admins=false" \
  --field "required_pull_request_reviews=null" \
  --field "restrictions=null"
```

## What this enforces

| Required check | What it runs |
|---|---|
| `Validate (tokens · build · test · changeset)` | `pnpm tokens:build` → dist stale check → `pnpm build` → `pnpm test` → `pnpm build-storybook` → changeset check |

The token-diff comment (`token-pr.yml`) is informational only — it doesn't block merge.

## Additional protection (optional, recommended)

### Require a Changeset via merge queue

If you'd like to enforce changesets at the merge level (not just via CI comment):

```bash
# Require PR reviews before merge
gh api "repos/$OWNER/$REPO/branches/main/protection" \
  --method PUT \
  --field "required_pull_request_reviews[required_approving_review_count]=1" \
  --field "required_pull_request_reviews[dismiss_stale_reviews]=true" \
  --field "required_status_checks[strict]=true" \
  --field "required_status_checks[contexts][]=Validate (tokens · build · test · changeset)" \
  --field "enforce_admins=false" \
  --field "restrictions=null"
```

### Protect design/* branches (Tokens Studio pushes)

Tokens Studio creates PRs from `design/*` branches. To prevent direct pushes to those:

```bash
gh api "repos/$OWNER/$REPO/branches/design%2F*/protection" \
  --method PUT \
  --field "required_pull_request_reviews[required_approving_review_count]=0" \
  --field "required_status_checks[strict]=true" \
  --field "required_status_checks[contexts][]=Token PR Review / Post token diff comment" \
  --field "enforce_admins=false" \
  --field "restrictions=null"
```

## Verify protection is active

```bash
gh api "repos/$OWNER/$REPO/branches/main/protection" | jq '{
  required_checks: .required_status_checks.contexts,
  enforce_admins:  .enforce_admins.enabled,
  dismiss_stale:   .required_pull_request_reviews.dismiss_stale_reviews
}'
```

## Acceptance: Phase 7 two-way sync

With branch protection active, the full loop works:

```
Edit token in Figma
  → Tokens Studio push → PR on design/token-*
  → CI: token-pr.yml posts colour-swatch diff
  → CI: ci.yml validates build + tests + changeset
  → Reviewer approves → Merge to main
  → CI: docs.yml deploys updated docs + Storybook
  → CI: figma-sync.yml pushes updated Variables back to Figma (idempotent --update)
```

Total time from Figma edit to live: **~5 minutes** (CI build) + review time.
