import type { Metadata } from 'next';
import '@/styles/globals.css';
import { ToastProvider } from '@/components/ui';
import { DataProvider } from '@/contexts/DataContext';
import { LayoutContent } from './LayoutContent';
import styles from './layout.module.css';

/**
 * Application metadata
 */
export const metadata: Metadata = {
  title: 'Email Data Management',
  description: 'Email collection system for academic journal marketing campaigns',
};

/**
 * Root Layout
 * 
 * Provides the main application layout with sidebar navigation.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ToastProvider>
          <DataProvider>
            <LayoutContent>{children}</LayoutContent>
          </DataProvider>
        </ToastProvider>
      </body>
    </html>
  );
}
