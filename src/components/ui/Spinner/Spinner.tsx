import React from 'react';
import { cn } from '@/lib/utils';
import styles from './Spinner.module.css';

/**
 * Spinner size types
 */
export type SpinnerSize = 'sm' | 'md' | 'lg';

/**
 * Spinner component props
 */
export interface SpinnerProps {
  /** Size of the spinner */
  size?: SpinnerSize;
  /** Additional class names */
  className?: string;
}

/**
 * Spinner component
 * 
 * A loading spinner indicator.
 * 
 * @example
 * ```tsx
 * <Spinner size="md" />
 * ```
 */
function Spinner({ size = 'md', className }: SpinnerProps) {
  return (
    <div
      className={cn(styles.spinner, styles[size], className)}
      role="status"
      aria-label="Loading"
    >
      <svg
        className={styles.icon}
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className={styles.track}
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className={styles.head}
          fill="currentColor"
          d="m4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );
}

export default Spinner;
