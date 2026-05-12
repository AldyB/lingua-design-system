import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface TopBarProps {
  title: string;
  subtitle?: string;
  leftAction?: ReactNode;
  rightActions?: ReactNode;
  className?: string;
}

export function TopBar({ title, subtitle, leftAction, rightActions, className }: TopBarProps) {
  return (
    <header className={cn('lds-topbar', className)}>
      {leftAction && <div>{leftAction}</div>}
      <div style={{ flex: 1 }}>
        <p className="lds-topbar__title">{title}</p>
        {subtitle && <p className="lds-topbar__subtitle">{subtitle}</p>}
      </div>
      {rightActions && <div className="lds-topbar__actions">{rightActions}</div>}
    </header>
  );
}
