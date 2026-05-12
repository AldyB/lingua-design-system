import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  children: ReactNode;
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ interactive, children, className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn('lds-card', interactive && 'lds-card--interactive', className)}
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      {...props}
    >
      {children}
    </div>
  ),
);
Card.displayName = 'Card';

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn('lds-card__title', className)} style={{ fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{children}</h3>;
}

export function CardContent({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn('lds-card__content', className)}>{children}</div>;
}
