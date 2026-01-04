'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout';
import { Button, Card, CardHeader, CardContent, Input, Spinner, useToast } from '@/components/ui';
import styles from './page.module.css';

/**
 * LocalStorage key for database URL
 */
const DB_URL_STORAGE_KEY = 'email_management_db_url';

/**
 * Settings Page
 * 
 * Configure database connection URL.
 * URL is stored in localStorage (client-side) and passed to API routes via headers.
 */
export default function SettingsPage() {
  const { addToast } = useToast();
  const [databaseUrl, setDatabaseUrl] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [lastUpdated, setLastUpdated] = useState<string>('');

  /**
   * Load settings from localStorage
   */
  useEffect(() => {
    loadSettings();
  }, []);

  /**
   * Load settings from localStorage
   */
  const loadSettings = () => {
    setIsLoading(true);
    try {
      const savedUrl = localStorage.getItem(DB_URL_STORAGE_KEY);
      const savedDate = localStorage.getItem(`${DB_URL_STORAGE_KEY}_updated`);
      
      if (savedUrl) {
        setDatabaseUrl(savedUrl);
      } else {
        // Show placeholder if no URL saved
        setDatabaseUrl('');
      }
      
      if (savedDate) {
        setLastUpdated(savedDate);
      }
    } catch (error) {
      console.error('Error loading settings from localStorage:', error);
      addToast('Failed to load settings from localStorage', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  /**
   * Save settings to localStorage
   */
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!databaseUrl.trim()) {
      addToast('Database URL is required', 'error');
      return;
    }

    if (!databaseUrl.startsWith('mysql://') && !databaseUrl.startsWith('postgresql://')) {
      addToast('Database URL must start with mysql:// or postgresql://', 'error');
      return;
    }

    setIsSaving(true);
    try {
      // Validate URL format via API
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ databaseUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid database URL');
      }

      // Save to localStorage
      const updatedAt = new Date().toISOString();
      localStorage.setItem(DB_URL_STORAGE_KEY, databaseUrl);
      localStorage.setItem(`${DB_URL_STORAGE_KEY}_updated`, updatedAt);
      setLastUpdated(updatedAt);
      
      addToast('Settings saved to localStorage. Refresh the page to apply changes.', 'success');
    } catch (error) {
      console.error('Error saving settings:', error);
      addToast(error instanceof Error ? error.message : 'Failed to save settings', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Test database connection
   */
  const handleTestConnection = async () => {
    if (!databaseUrl.trim()) {
      addToast('Please enter a database URL first', 'error');
      return;
    }

    setIsSaving(true);
    try {
      // Save to localStorage first
      localStorage.setItem(DB_URL_STORAGE_KEY, databaseUrl);
      
      // Test the connection
      const testResponse = await fetch('/api/test-db', {
        headers: {
          'X-Database-URL': databaseUrl,
        },
      });
      
      const testData = await testResponse.json();

      if (testResponse.ok && testData.success) {
        addToast('Database connection successful!', 'success');
      } else {
        throw new Error(testData.error || 'Connection test failed');
      }
    } catch (error) {
      console.error('Error testing connection:', error);
      addToast(error instanceof Error ? error.message : 'Failed to connect to database', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  /**
   * Clear settings
   */
  const handleClear = () => {
    if (confirm('Are you sure you want to clear the saved database URL?')) {
      localStorage.removeItem(DB_URL_STORAGE_KEY);
      localStorage.removeItem(`${DB_URL_STORAGE_KEY}_updated`);
      setDatabaseUrl('');
      setLastUpdated('');
      addToast('Settings cleared. The app will use environment variables if available.', 'info');
    }
  };

  /**
   * Format date for display
   */
  const formatDate = (dateString: string) => {
    if (!dateString) return 'Never';
    const date = new Date(dateString);
    return date.toLocaleString();
  };

  if (isLoading) {
    return (
      <>
        <Header
          title="Settings"
          description="Configure application settings"
        />
        <div className={styles.loadingContainer}>
          <Spinner size="lg" />
          <p>Loading settings...</p>
        </div>
      </>
    );
  }

  return (
    <>
      <Header
        title="Settings"
        description="Configure database connection (stored in browser localStorage)"
      />
      
      <div className={styles.container}>
        <Card>
          <CardHeader>
            <h2 className={styles.cardTitle}>Database Configuration</h2>
            <p className={styles.cardDescription}>
              Configure your MySQL database connection (local or remote). Settings are stored in your browser's localStorage.
            </p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSave} className={styles.form}>
              <div className={styles.formGroup}>
                <label htmlFor="databaseUrl" className={styles.label}>
                  Database URL
                </label>
                <Input
                  id="databaseUrl"
                  type="text"
                  value={databaseUrl}
                  onChange={(e) => setDatabaseUrl(e.target.value)}
                  placeholder="mysql://username:password@host:port/database"
                  className={styles.input}
                  disabled={isSaving}
                />
                <p className={styles.helpText}>
                  Format: mysql://username:password@host:port/database
                </p>
                <p className={styles.helpText}>
                  Local: mysql://root:password@localhost:3306/email_data_management
                </p>
                <p className={styles.helpText}>
                  Remote: mysql://user:pass@db.example.com:3306/database
                </p>
              </div>

              {lastUpdated && (
                <div className={styles.infoBox}>
                  <svg className={styles.infoIcon} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
                  </svg>
                  <span>Last updated: {formatDate(lastUpdated)}</span>
                </div>
              )}

              <div className={styles.actions}>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleClear}
                  disabled={isSaving || !databaseUrl}
                >
                  Clear Settings
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTestConnection}
                  disabled={isSaving || !databaseUrl}
                >
                  {isSaving ? (
                    <>
                      <Spinner size="sm" />
                      <span>Testing...</span>
                    </>
                  ) : (
                    'Test Connection'
                  )}
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isSaving}
                >
                  {isSaving ? (
                    <>
                      <Spinner size="sm" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    'Save to Browser'
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <h2 className={styles.cardTitle}>Important Notes</h2>
          </CardHeader>
          <CardContent>
            <ul className={styles.notesList}>
              <li>
                <strong>Storage:</strong> Database URL is saved in your browser's localStorage. 
                It will persist across page reloads but is specific to this browser and user.
              </li>
              <li>
                <strong>Multi-User Support:</strong> Each user can configure their own MySQL URL (local or remote). 
                Perfect for teams where different users connect to different databases.
              </li>
              <li>
                <strong>Format:</strong> The database URL must follow the connection string format: 
                mysql://username:password@host:port/database
              </li>
              <li>
                <strong>Refresh Required:</strong> After saving, refresh the page for changes to take effect.
              </li>
              <li>
                <strong>Remote Databases:</strong> Works with any remote MySQL server. Enter the full connection 
                URL including hostname, port, and credentials.
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
