'use client';

import React, {
  createContext,
  useContext,
  useCallback,
  useState,
  type ReactNode,
} from 'react';
import { cn, generateId } from '@/lib/utils';
import styles from './Toast.module.css';

/**
 * Toast types
 */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/**
 * Toast item interface
 */
export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

/**
 * Toast context interface
 */
interface ToastContextType {
  toasts: ToastItem[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  removeToast: (id: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

/**
 * Hook to use toast functionality
 */
export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider');
  }
  return context;
}

/**
 * Toast Provider props
 */
interface ToastProviderProps {
  children: ReactNode;
}

/**
 * Toast Provider component
 * 
 * Provides toast notification functionality to the application.
 * 
 * @example
 * ```tsx
 * // In layout.tsx
 * <ToastProvider>
 *   {children}
 * </ToastProvider>
 * 
 * // In any component
 * const { addToast } = useToast();
 * addToast('Operation successful!', 'success');
 * ```
 */
export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = 'info', duration: number = 5000) => {
      const id = generateId();
      const newToast: ToastItem = { id, message, type, duration };
      
      setToasts((prev) => [...prev, newToast]);

      if (duration > 0) {
        setTimeout(() => {
          removeToast(id);
        }, duration);
      }
    },
    [removeToast],
  );

  return (
    <ToastContext.Provider value={{ toasts, addToast, removeToast }}>
      {children}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </ToastContext.Provider>
  );
}

/**
 * Toast Container props
 */
interface ToastContainerProps {
  toasts: ToastItem[];
  removeToast: (id: string) => void;
}

/**
 * Toast Container component
 */
function ToastContainer({ toasts, removeToast }: ToastContainerProps) {
  if (toasts.length === 0) return null;

  return (
    <div className={styles.container} role="region" aria-label="Notifications">
      {toasts.map((toast) => (
        <Toast key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
}

/**
 * Individual Toast props
 */
interface ToastProps {
  toast: ToastItem;
  onClose: () => void;
}

/**
 * Individual Toast component
 */
function Toast({ toast, onClose }: ToastProps) {
  const icons: Record<ToastType, ReactNode> = {
    success: (
      <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
      </svg>
    ),
    error: (
      <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
      </svg>
    ),
    warning: (
      <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    ),
    info: (
      <svg className={styles.icon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  };

  return (
    <div
      className={cn(styles.toast, styles[toast.type])}
      role="alert"
      aria-live="polite"
    >
      <span className={styles.iconWrapper}>{icons[toast.type]}</span>
      <p className={styles.message}>{toast.message}</p>
      <button
        type="button"
        className={styles.closeButton}
        onClick={onClose}
        aria-label="Close notification"
      >
        <svg className={styles.closeIcon} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}

export default ToastProvider;
