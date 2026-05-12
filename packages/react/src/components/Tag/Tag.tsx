import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface TagProps {
  children: ReactNode;
  onRemove?: () => void;
  className?: string;
}

export function Tag({ children, onRemove, className }: TagProps) {
  return (
    <span className={cn('lds-tag', className)}>
      {children}
      {onRemove && (
        <button
          className="lds-tag__remove"
          onClick={onRemove}
          aria-label={`Remove ${children}`}
          type="button"
        >
          ×
        </button>
      )}
    </span>
  );
}
