import React, { type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/lib/utils';
import styles from './Card.module.css';

/**
 * Card component props
 */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /** Card content */
  children: ReactNode;
  /** Whether to add padding */
  noPadding?: boolean;
}

/**
 * Card Header component props
 */
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  /** Title text */
  title?: string;
  /** Description text */
  description?: string;
  /** Action element (button, link, etc.) */
  action?: ReactNode;
  /** Children elements */
  children?: ReactNode;
}

/**
 * Card component
 * 
 * A container component with optional header and content sections.
 * 
 * @example
 * ```tsx
 * <Card>
 *   <CardHeader title="Dashboard" action={<Button>Add</Button>} />
 *   <CardContent>Content here</CardContent>
 * </Card>
 * ```
 */
function Card({ className, children, noPadding = false, ...props }: CardProps) {
  return (
    <div className={cn(styles.card, noPadding && styles.noPadding, className)} {...props}>
      {children}
    </div>
  );
}

/**
 * Card Header component
 */
function CardHeader({
  className,
  title,
  description,
  action,
  children,
  ...props
}: CardHeaderProps) {
  return (
    <div className={cn(styles.header, className)} {...props}>
      <div className={styles.headerContent}>
        {title && <h3 className={styles.title}>{title}</h3>}
        {description && <p className={styles.description}>{description}</p>}
        {children}
      </div>
      {action && <div className={styles.action}>{action}</div>}
    </div>
  );
}

/**
 * Card Content component props
 */
export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * Card Content component
 */
function CardContent({ className, children, ...props }: CardContentProps) {
  return (
    <div className={cn(styles.content, className)} {...props}>
      {children}
    </div>
  );
}

/**
 * Card Footer component props
 */
export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

/**
 * Card Footer component
 */
function CardFooter({ className, children, ...props }: CardFooterProps) {
  return (
    <div className={cn(styles.footer, className)} {...props}>
      {children}
    </div>
  );
}

export { Card, CardHeader, CardContent, CardFooter };
export default Card;
