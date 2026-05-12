import { cn } from '../../lib/utils';

export type SpinnerSize = 'sm' | 'md' | 'lg';

export interface SpinnerProps {
  size?: SpinnerSize;
  label?: string;
  className?: string;
}

export function Spinner({ size = 'md', label = 'Loading…', className }: SpinnerProps) {
  return (
    <span
      role="status"
      aria-label={label}
      className={cn('lds-spinner', `lds-spinner--${size}`, className)}
    />
  );
}
