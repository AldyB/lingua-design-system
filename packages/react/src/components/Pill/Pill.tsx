import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface PillProps { children: ReactNode; className?: string; }

export function Pill({ children, className }: PillProps) {
  return <span className={cn('lds-pill', className)}>{children}</span>;
}
