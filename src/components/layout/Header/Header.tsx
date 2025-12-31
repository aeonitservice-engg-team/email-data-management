'use client';

import React from 'react';
import { useLayout } from '@/app/LayoutContent';
import styles from './Header.module.css';

/**
 * Header component props
 */
interface HeaderProps {
  /** Page title */
  title: string;
  /** Optional description */
  description?: string;
  /** Action elements (buttons, etc.) */
  actions?: React.ReactNode;
}

/**
 * Header component
 * 
 * Page header with title, description, and optional actions.
 */
function Header({ title, description, actions }: HeaderProps) {
  const { toggleMobileMenu } = useLayout();
  
  return (
    <header className={styles.header}>
      {/* Mobile menu button */}
      <button
        className={styles.menuButton}
        onClick={toggleMobileMenu}
        aria-label="Toggle menu"
      >
        <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
      
      <div className={styles.titleSection}>
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}

export default Header;
