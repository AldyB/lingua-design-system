# Design Handover — Reference Components

These files are **reference implementations** copied verbatim from the `lingua-cards` source app.
They are **excluded from the build** (see `tsconfig.json` `exclude` list).

Phase 3 will port each component into a clean, token-driven version in `src/components/`.

## Files

| File | Source |
|---|---|
| `FlashcardFlipper.tsx` | `lingua-cards/src/components/FlashcardFlipper.tsx` |
| `Study.tsx` | `lingua-cards/src/pages/Study.tsx` |

## What changes in Phase 3
- Path aliases (`@/lib/utils`, `@/components/ui/*`) → real npm imports from `@lingua/tokens`
- Hard-coded hex values → token variables
- App-specific hooks (`useFlashcards`, `useProfile`) → component props / render props
- Storybook stories + Vitest tests added
