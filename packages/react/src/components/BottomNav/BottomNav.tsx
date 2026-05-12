import { type ReactNode } from 'react';
import { cn } from '../../lib/utils';

export interface NavItem {
  label: string;
  href?: string;
  icon: ReactNode;
  active?: boolean;
  onClick?: () => void;
}

export interface BottomNavProps {
  items: NavItem[];
  fixed?: boolean;
  className?: string;
}

export function BottomNav({ items, fixed = true, className }: BottomNavProps) {
  return (
    <nav
      aria-label="Main navigation"
      className={cn('lds-bottom-nav', fixed && 'lds-bottom-nav--fixed', className)}
    >
      {items.map(item => {
        const Tag = item.href ? 'a' : 'button';
        return (
          <Tag
            key={item.label}
            href={item.href}
            onClick={item.onClick}
            className="lds-bottom-nav__item"
            aria-current={item.active ? 'page' : undefined}
            aria-label={item.label}
            type={item.href ? undefined : 'button'}
          >
            <span className="lds-bottom-nav__icon" aria-hidden="true">{item.icon}</span>
            <span>{item.label}</span>
          </Tag>
        );
      })}
    </nav>
  );
}
