'use client';

import React from 'react';
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
  return (
    <header className={styles.header}>
      <div className={styles.titleSection}>
        <h1 className={styles.title}>{title}</h1>
        {description && <p className={styles.description}>{description}</p>}
      </div>
      {actions && <div className={styles.actions}>{actions}</div>}
    </header>
  );
}

export default Header;
