import { cn } from '../../lib/utils';

export interface StreakCounterProps {
  days: number;
  className?: string;
}

export function StreakCounter({ days, className }: StreakCounterProps) {
  return (
    <span
      className={cn('lds-streak', className)}
      aria-label={`${days} day streak`}
    >
      <span aria-hidden="true">🔥</span>
      <span className="lds-streak__count">{days}</span>
      <span className="lds-streak__label">{days === 1 ? 'day' : 'days'}</span>
    </span>
  );
}
