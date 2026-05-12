import { cn } from '../../lib/utils';

export type AvatarSize = 'sm' | 'md' | 'lg';

export interface AvatarProps {
  src?: string;
  alt?: string;
  fallback?: string;
  size?: AvatarSize;
  className?: string;
}

export function Avatar({ src, alt = '', fallback, size = 'md', className }: AvatarProps) {
  const initials = fallback ?? (alt.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || '?');

  return (
    <span
      className={cn('lds-avatar', `lds-avatar--${size}`, className)}
      aria-label={alt || fallback}
    >
      {src
        ? <img src={src} alt={alt} />
        : initials}
    </span>
  );
}
