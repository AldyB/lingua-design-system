# Phase 8 — Consumer Migration Guide

How to migrate a consumer app (e.g. **lingua-cards**) from local CSS variables and components onto `@lingua/tokens` and `@lingua/react`.

The acceptance bar: **bumping a token colour in the design system → consumer app picks it up with zero app-code changes.**

---

## Migration paths

| Your app uses | Path |
|---|---|
| **shadcn/ui** (HSL CSS vars: `--primary`, `--muted-foreground`) | **Path A — Drop-in shim** (recommended for lingua-cards) |
| Custom CSS vars matching `@lingua/tokens` naming | **Path B — Direct import** |
| Tailwind-only (no CSS vars) | **Path C — Tailwind preset** |

---

## Path A — Drop-in shim (shadcn/ui apps)

`@lingua/tokens` ships a `lingua.shadcn.css` file that exposes our semantic colours under the **shadcn/ui naming convention** in **HSL triplet format**:

```css
/* lingua.shadcn.css output */
:root {
  --background:      210 40% 98%;
  --foreground:      222 47% 11%;
  --primary:         243 75% 59%;
  --primary-foreground: 0 0% 100%;
  --muted:           210 40% 96%;
  --muted-foreground: 215 16% 47%;
  /* …all 17 semantic vars + popover aliases */
}
.dark { /* dark overrides */ }
```

Your existing `hsl(var(--primary))` Tailwind colour mappings keep working — they now resolve into design system values.

### Steps

1. **Add the design system as a dep** (workspace, file, or published version):

   ```bash
   # Option 1: published version (after Phase 8 publishing)
   pnpm add @lingua/tokens @lingua/react

   # Option 2: file: protocol (during dev, for monorepos co-located on disk)
   pnpm add "file:../lingua-design-system/packages/tokens" \
            "file:../lingua-design-system/packages/react"
   ```

2. **Replace your local CSS variable block** in `src/index.css`:

   ```diff
   - @layer base {
   -   :root {
   -     --background:          210 30% 96%;
   -     --foreground:          228 28% 10%;
   -     --primary:             256 76% 52%;
   -     /* …~50 more lines of hand-written vars */
   -   }
   -   .dark { /* …matching dark overrides */ }
   - }
   + @import "@lingua/tokens/css/lingua.shadcn.css";
   ```

3. **Keep your existing Tailwind config**, add the preset for spacing/radius/typography:

   ```diff
   // tailwind.config.ts
   + import linguaPreset from "@lingua/tokens/tailwind";
     export default {
   +   presets: [linguaPreset],
       content: [...],
       theme: {
         extend: {
           colors: {
             primary:    { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
             // …keep your existing color mappings — they now resolve into @lingua/tokens
           }
         }
       }
     }
   ```

4. **Import @lingua/react styles** in your app entry (`main.tsx` or `App.tsx`):

   ```ts
   import '@lingua/react/styles.css';
   ```

5. **Verify**: change a value in `tokens/lingua-tokens.json`, run `pnpm tokens:build`, refresh your app — the colour propagates without touching app code.

---

## Replacing local components

After Path A is complete, you can incrementally swap local components for `@lingua/react` versions.

### Quick wins (drop-in replacements)

| Local component | `@lingua/react` equivalent | Notes |
|---|---|---|
| `FlashcardFlipper` | `Flashcard` | Same swipe + flip behaviour. Props renamed: `spanishWord`→`front`, `englishTranslation`→`back`, `onSwipeRight`→`onCorrect`. |
| `BottomNav` (custom) | `BottomNav` | Pass `items` array with `{ label, icon, href, active }` |
| `StreakCounter` | `StreakCounter` | Pass `days` prop |
| `MasteryDots` | `MasteryMeter` | Pass `mastered`, `learning`, `newCards` |

### Example: migrating Study.tsx

```diff
- import { FlashcardFlipper } from '@/components/FlashcardFlipper';
+ import { Flashcard } from '@lingua/react';

  …

- <FlashcardFlipper
-   spanishWord={currentCard.spanish_word}
-   englishTranslation={currentCard.english_translation}
-   exampleSentenceEs={currentCard.example_sentence_es}
-   exampleSentenceEn={currentCard.example_sentence_en}
-   onSwipeLeft={() => handleAnswer(false)}
-   onSwipeRight={() => handleAnswer(true)}
- />
+ <Flashcard
+   front={currentCard.spanish_word}
+   back={currentCard.english_translation}
+   exampleFront={currentCard.example_sentence_es}
+   exampleBack={currentCard.example_sentence_en}
+   onIncorrect={() => handleAnswer(false)}
+   onCorrect={() => handleAnswer(true)}
+ />
```

### Components to keep local (for now)

These are app-specific and not in the design system — leave them alone:
- `CreateCardForm` (uses Claude API for translation)
- `OCRWordSelector` (Tesseract OCR)
- `PhotoCapture` (camera/file picker)
- `useFlashcards`, `useProfile` (Supabase hooks)

---

## Path B — Direct import (apps using `@lingua/tokens` naming)

If you're starting fresh or your app already uses `--color-primary` style:

```ts
// src/index.css or main.tsx
import '@lingua/tokens/css/lingua.light.css';
import '@lingua/tokens/css/lingua.dark.css';
import '@lingua/react/styles.css';
```

Then in your Tailwind config, use `var(--color-primary)` directly:
```ts
// tailwind.config.ts
import linguaPreset from "@lingua/tokens/tailwind";
export default { presets: [linguaPreset], content: [...] };
```

---

## Path C — Tailwind preset only (no CSS vars yet)

For apps that don't have CSS vars set up, just adopt the Tailwind preset:

```ts
// tailwind.config.ts
import linguaPreset from "@lingua/tokens/tailwind";
export default { presets: [linguaPreset], content: [...] };
```

Now `bg-primary-600`, `gap-4`, `rounded-2xl` all use design system values.

---

## Setting up Dependabot (weekly bumps)

Add `.github/dependabot.yml` to your consumer app — see `docs/dependabot-template.yml` for a full template.

Minimal version:
```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: "/"
    schedule: { interval: weekly, day: monday }
    groups:
      lingua-ds:
        patterns: ["@lingua/*"]
```

This opens a single PR per week bundling all `@lingua/*` updates. Approve → CI runs → merge.

---

## Theme switching

`@lingua/tokens` uses `[data-theme="dark"]` by default; the shadcn shim uses `.dark` (the shadcn convention). Your existing theme toggle keeps working — we match shadcn's selector in the shim.

---

## Verifying acceptance

After migration, run this test to verify the **zero app-code change** acceptance:

1. In `lingua-design-system`: change `tokens/lingua-tokens.json` → `light.color.primary` from `{global.color.primary.600}` to `{global.color.primary.700}`
2. Run `pnpm tokens:build`
3. In your consumer app, refresh — the primary colour shifts darker
4. **App code was not touched.** ✓

---

## Publishing path (when ready)

Until then, use `file:` protocol or GitHub Packages from a local install.

Once `@lingua/*` is published to GitHub Packages (Phase 8 release workflow):

```bash
# Add to consumer app .npmrc:
echo "@lingua:registry=https://npm.pkg.github.com" >> .npmrc

# Then install normally:
pnpm add @lingua/tokens @lingua/react
```

See [DECISIONS.md](../DECISIONS.md) §2 for the registry decision.

---

## Troubleshooting

| Issue | Fix |
|---|---|
| Tailwind classes show wrong colours | Ensure `@import "@lingua/tokens/css/lingua.shadcn.css"` runs **before** your `@tailwind base` |
| Dark mode doesn't switch | Confirm theme toggle sets `.dark` class on `<html>` (shadcn convention), not `[data-theme="dark"]` |
| `Module not found: @lingua/react` | Run `pnpm install`; for `file:` protocol, ensure relative path is correct |
| Component looks unstyled | Did you `import '@lingua/react/styles.css'` in your app entry? |
