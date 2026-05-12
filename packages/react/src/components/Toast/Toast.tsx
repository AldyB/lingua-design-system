import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export type ToastVariant = 'default' | 'success' | 'error' | 'warning';

export interface ToastProps {
  title: string;
  description?: string;
  variant?: ToastVariant;
  icon?: ReactNode;
  onClose?: () => void;
  className?: string;
}

export function Toast({ title, description, variant = 'default', icon, onClose, className }: ToastProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn('lds-toast', variant !== 'default' && `lds-toast--${variant}`, className)}
    >
      {icon && <span className="lds-toast__icon" aria-hidden="true">{icon}</span>}
      <div className="lds-toast__body">
        <p className="lds-toast__title">{title}</p>
        {description && <p className="lds-toast__desc">{description}</p>}
      </div>
      {onClose && (
        <button className="lds-toast__close" onClick={onClose} aria-label="Dismiss">
          ×
        </button>
      )}
    </div>
  );
}
