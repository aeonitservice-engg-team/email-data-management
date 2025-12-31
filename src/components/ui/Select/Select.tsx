import React, { forwardRef, type SelectHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';
import styles from './Select.module.css';

/**
 * Option type for select component
 */
export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

/**
 * Select component props
 */
export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'children'> {
  /** Label text for the select */
  label?: string;
  /** Options to display */
  options: SelectOption[];
  /** Placeholder option text */
  placeholder?: string;
  /** Error message to display */
  error?: string;
  /** Helper text below the select */
  helperText?: string;
  /** Whether the select should take full width */
  fullWidth?: boolean;
}

/**
 * Select component
 * 
 * A styled select dropdown component with label and error support.
 * 
 * @example
 * ```tsx
 * <Select
 *   label="Brand"
 *   options={[
 *   ]}
 *   placeholder="Select a brand"
 * />
 * ```
 */
const Select = forwardRef<HTMLSelectElement, SelectProps>(
  (
    {
      className,
      label,
      options,
      placeholder,
      error,
      helperText,
      fullWidth = false,
      id,
      ...props
    },
    ref,
  ) => {
    const selectId = id || `select-${Math.random().toString(36).substr(2, 9)}`;

    return (
      <div className={cn(styles.container, fullWidth && styles.fullWidth)}>
        {label && (
          <label htmlFor={selectId} className={styles.label}>
            {label}
          </label>
        )}
        <div className={styles.selectWrapper}>
          <select
            ref={ref}
            id={selectId}
            className={cn(
              styles.select,
              error && styles.hasError,
              className,
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${selectId}-error` : helperText ? `${selectId}-helper` : undefined}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option key={option.value} value={option.value} disabled={option.disabled}>
                {option.label}
              </option>
            ))}
          </select>
          <span className={styles.chevron}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className={styles.chevronIcon}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </span>
        </div>
        {error && (
          <p id={`${selectId}-error`} className={styles.error} role="alert">
            {error}
          </p>
        )}
        {helperText && !error && (
          <p id={`${selectId}-helper`} className={styles.helperText}>
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Select.displayName = 'Select';

export default Select;
