'use client';

import React, { useState, createContext, useContext } from 'react';
import { Sidebar } from '@/components/layout';
import styles from './layout.module.css';

/**
 * Layout context for mobile menu
 */
const LayoutContext = createContext({
  toggleMobileMenu: () => {},
});

export const useLayout = () => useContext(LayoutContext);

/**
 * Layout Content Component
 * 
 * Client component that manages mobile sidebar state.
 */
export function LayoutContent({ children }: { children: React.ReactNode }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(prev => !prev);

  return (
    <LayoutContext.Provider value={{ toggleMobileMenu }}>
      <div className={styles.layout}>
        <Sidebar 
          isOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)} 
        />
        <main className={styles.main}>
          <div className={styles.content}>
            {children}
          </div>
        </main>
      </div>
    </LayoutContext.Provider>
  );
}
