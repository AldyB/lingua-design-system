import { cn } from '../../lib/utils';

const CATEGORY_COLORS: Record<string, string> = {
  general: 'var(--cat-general, #6366f1)',
  food:    'var(--cat-food,    #f59e0b)',
  travel:  'var(--cat-travel,  #06b6d4)',
  nature:  'var(--cat-nature,  #22c55e)',
  people:  'var(--cat-people,  #ec4899)',
  work:    'var(--cat-work,    #8b5cf6)',
  home:    'var(--cat-home,    #f97316)',
  health:  'var(--cat-health,  #14b8a6)',
};

export interface CategoryChipProps {
  category: string;
  className?: string;
}

export function CategoryChip({ category, className }: CategoryChipProps) {
  const color = CATEGORY_COLORS[category.toLowerCase()] ?? 'var(--color-primary, #4f46e5)';
  return (
    <span
      className={cn('lds-cat-chip', className)}
      style={{ '--lds-cat-color': color } as React.CSSProperties}
    >
      <span className="lds-cat-chip__dot" aria-hidden="true" />
      {category.charAt(0).toUpperCase() + category.slice(1)}
    </span>
  );
}
