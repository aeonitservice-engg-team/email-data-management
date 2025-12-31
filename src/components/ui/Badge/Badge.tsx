import React from 'react';
import { cn } from '@/lib/utils';
import styles from './Badge.module.css';

/**
 * Badge variant types
 */
export type BadgeVariant = 'primary' | 'secondary' | 'success' | 'warning' | 'error' | 'neutral';

/**
 * Badge component props
 */
export interface BadgeProps {
  /** Badge content */
  children: React.ReactNode;
  /** Visual style variant */
  variant?: BadgeVariant;
  /** Additional class names */
  className?: string;
}

/**
 * Badge component
 * 
 * A small status indicator badge.
 * 
 * @example
 * ```tsx
 * <Badge variant="success">Active</Badge>
 * <Badge variant="error">Inactive</Badge>
 * ```
 */
function Badge({ children, variant = 'primary', className }: BadgeProps) {
  return (
    <span className={cn(styles.badge, styles[variant], className)}>
      {children}
    </span>
  );
}

export default Badge;
