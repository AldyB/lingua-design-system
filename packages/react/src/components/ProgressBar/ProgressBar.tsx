import { cn } from '../../lib/utils';

export type ProgressVariant = 'default' | 'success' | 'warning';
export type ProgressSize = 'sm' | 'md' | 'lg';

export interface ProgressBarProps {
  value: number;
  max?: number;
  variant?: ProgressVariant;
  size?: ProgressSize;
  label?: string;
  className?: string;
}

export function ProgressBar({ value, max = 100, variant = 'default', size = 'md', label, className }: ProgressBarProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  return (
    <div
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className={cn('lds-progress', size !== 'md' && `lds-progress--${size}`, className)}
    >
      <div
        className={cn('lds-progress__fill', variant !== 'default' && `lds-progress__fill--${variant}`)}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}
