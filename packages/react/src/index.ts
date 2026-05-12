/**
 * @lingua/react — Public API
 * Import styles once in your app entry:  import '@lingua/react/styles.css'
 * Import token CSS from @lingua/tokens:  import '@lingua/tokens/css/lingua.light.css'
 */

// ── Utilities ──────────────────────────────────────────────────────────────
export { cn } from './lib/utils';

// ── Primitives ─────────────────────────────────────────────────────────────
export { Button }       from './components/Button/Button';
export type { ButtonProps, ButtonVariant, ButtonSize } from './components/Button/Button';

export { Badge }        from './components/Badge/Badge';
export type { BadgeProps, BadgeVariant } from './components/Badge/Badge';

export { Pill }         from './components/Pill/Pill';
export type { PillProps } from './components/Pill/Pill';

export { Tag }          from './components/Tag/Tag';
export type { TagProps } from './components/Tag/Tag';

export { Avatar }       from './components/Avatar/Avatar';
export type { AvatarProps, AvatarSize } from './components/Avatar/Avatar';

// ── Surfaces ───────────────────────────────────────────────────────────────
export { Card, CardTitle, CardContent } from './components/Card/Card';
export type { CardProps } from './components/Card/Card';

export { Sheet }        from './components/Sheet/Sheet';
export type { SheetProps } from './components/Sheet/Sheet';

// ── Inputs ─────────────────────────────────────────────────────────────────
export { TextField }    from './components/TextField/TextField';
export type { TextFieldProps } from './components/TextField/TextField';

export { Select }       from './components/Select/Select';
export type { SelectProps, SelectOption } from './components/Select/Select';

export { Checkbox }     from './components/Checkbox/Checkbox';
export type { CheckboxProps } from './components/Checkbox/Checkbox';

export { RadioGroup }   from './components/RadioGroup/RadioGroup';
export type { RadioGroupProps, RadioOption } from './components/RadioGroup/RadioGroup';

export { Switch }       from './components/Switch/Switch';
export type { SwitchProps } from './components/Switch/Switch';

// ── Feedback ───────────────────────────────────────────────────────────────
export { ProgressBar }  from './components/ProgressBar/ProgressBar';
export type { ProgressBarProps, ProgressVariant, ProgressSize } from './components/ProgressBar/ProgressBar';

export { Spinner }      from './components/Spinner/Spinner';
export type { SpinnerProps, SpinnerSize } from './components/Spinner/Spinner';

export { Toast }        from './components/Toast/Toast';
export type { ToastProps, ToastVariant } from './components/Toast/Toast';

// ── Navigation ─────────────────────────────────────────────────────────────
export { BottomNav }    from './components/BottomNav/BottomNav';
export type { BottomNavProps, NavItem } from './components/BottomNav/BottomNav';

export { TopBar }       from './components/TopBar/TopBar';
export type { TopBarProps } from './components/TopBar/TopBar';

// ── Domain ─────────────────────────────────────────────────────────────────
export { Flashcard }    from './components/Flashcard/Flashcard';
export type { FlashcardProps } from './components/Flashcard/Flashcard';

export { CategoryChip } from './components/CategoryChip/CategoryChip';
export type { CategoryChipProps } from './components/CategoryChip/CategoryChip';

export { StreakCounter } from './components/StreakCounter/StreakCounter';
export type { StreakCounterProps } from './components/StreakCounter/StreakCounter';

export { MasteryMeter } from './components/MasteryMeter/MasteryMeter';
export type { MasteryMeterProps } from './components/MasteryMeter/MasteryMeter';

export const version = '0.1.0';
