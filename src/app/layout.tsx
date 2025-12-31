import type { Metadata } from 'next';
import '@/styles/globals.css';
import { ToastProvider } from '@/components/ui';
import { Sidebar } from '@/components/layout';
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
          <div className={styles.layout}>
            <Sidebar />
            <main className={styles.main}>
              <div className={styles.content}>
                {children}
              </div>
            </main>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}
