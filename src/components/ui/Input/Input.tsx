import React, { forwardRef, type InputHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import styles from './Input.module.css';

/**
 * Input component props
 */
export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  /** Label text for the input */
  label?: string;
  /** Error message to display */
  error?: string;
  /** Helper text below the input */
  helperText?: string;
  /** Icon to display on the left side */
  leftIcon?: React.ReactNode;
  /** Icon to display on the right side */
  rightIcon?: React.ReactNode;
  /** Whether the input should take full width */
  fullWidth?: boolean;
}

/**
 * Input component
 * 
 * A styled input component with support for labels, errors, and icons.
 * 
 * @example
 * ```tsx
 * <Input
 *   label="Email"
 *   type="email"
 *   placeholder="Enter your email"
 *   error={errors.email}
 * />
 * ```
 */
const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth = false,
      id,
      ...props
    },
    ref,
  ) => {
    const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={cn(styles.container, fullWidth && styles.fullWidth)}>
        {label && (
          <label htmlFor={inputId} className={styles.label}>
            {label}
          </label>
        )}
        <div className={styles.inputWrapper}>
          {leftIcon && <span className={styles.leftIcon}>{leftIcon}</span>}
          <input
            ref={ref}
            id={inputId}
            className={cn(
              styles.input,
              leftIcon && styles.hasLeftIcon,
              rightIcon && styles.hasRightIcon,
              error && styles.hasError,
              className,
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : helperText ? `${inputId}-helper` : undefined}
            {...props}
          />
          {rightIcon && <span className={styles.rightIcon}>{rightIcon}</span>}
        </div>
        {error && (
          <p id={`${inputId}-error`} className={styles.error} role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${inputId}-helper`} className={styles.helperText}>
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export default Input;
