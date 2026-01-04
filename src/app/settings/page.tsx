'use client';

import { useState, useEffect } from 'react';
import styles from './page.module.css';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface DatabaseSettings {
  databaseUrl: string | null;
  isConfigured: boolean;
  isDefault: boolean;
}

export default function SettingsPage() {
  const [databaseUrl, setDatabaseUrl] = useState('');
  const [currentSettings, setCurrentSettings] = useState<DatabaseSettings | null>(null);
  const [loading, setLoading] = useState(false);
  const [testing, setTesting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    loadSettings();
  }, []);

  const loadSettings = async () => {
    try {
      const storedUrl = localStorage.getItem('database_url');
      const response = await fetch('/api/settings/database', {
        headers: {
          'x-database-url': storedUrl || '',
        },
      });

      if (response.ok) {
        const data = await response.json();
        setCurrentSettings(data);
        if (storedUrl) {
          setDatabaseUrl(storedUrl);
        }
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const handleTestConnection = async () => {
    if (!databaseUrl) {
      setMessage({ type: 'error', text: 'Please enter a database URL' });
      return;
    }

    setTesting(true);
    setMessage(null);

    try {
      const response = await fetch('/api/settings/database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          databaseUrl,
          action: 'test',
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessage({ type: 'success', text: data.message });
      } else {
        setMessage({ type: 'error', text: data.message || 'Connection test failed' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to test connection' });
    } finally {
      setTesting(false);
    }
  };

  const handleSaveSettings = () => {
    if (!databaseUrl) {
      setMessage({ type: 'error', text: 'Please enter a database URL' });
      return;
    }

    setLoading(true);
    try {
      // Save to localStorage
      localStorage.setItem('database_url', databaseUrl);
      setMessage({ type: 'success', text: 'Database URL saved! Please refresh the page to apply changes.' });
      
      // Reload settings to reflect changes
      setTimeout(() => {
        loadSettings();
      }, 1000);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save settings' });
    } finally {
      setLoading(false);
    }
  };

  const handleClearSettings = () => {
    localStorage.removeItem('database_url');
    setDatabaseUrl('');
    setMessage({ type: 'success', text: 'Settings cleared. Using default database URL.' });
    loadSettings();
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Database Settings</h1>
        <p className={styles.subtitle}>
          Configure your PostgreSQL database connection for this session
        </p>
      </div>

      <div className={styles.content}>
        <Card>
          <div className={styles.cardContent}>
            <h2 className={styles.sectionTitle}>Database Configuration</h2>
            
            {currentSettings && (
              <div className={styles.currentStatus}>
                <p>
                  <strong>Status:</strong>{' '}
                  {currentSettings.isConfigured ? (
                    <span className={styles.statusActive}>Connected</span>
                  ) : (
                    <span className={styles.statusInactive}>Not Configured</span>
                  )}
                </p>
                {currentSettings.isDefault && (
                  <p className={styles.infoText}>
                    Currently using default database URL from environment variables
                  </p>
                )}
                {currentSettings.databaseUrl && !currentSettings.isDefault && (
                  <p className={styles.infoText}>
                    Current URL: {currentSettings.databaseUrl}
                  </p>
                )}
              </div>
            )}

            <div className={styles.formGroup}>
              <label htmlFor="databaseUrl" className={styles.label}>
                PostgreSQL Connection String
              </label>
              <Input
                id="databaseUrl"
                type="text"
                value={databaseUrl}
                onChange={(e) => setDatabaseUrl(e.target.value)}
                placeholder="postgresql://username:password@host:5432/database?sslmode=require"
                className={styles.input}
              />
              <p className={styles.helpText}>
                Format: postgresql://username:password@host:port/database?sslmode=require
              </p>
            </div>

            {message && (
              <div className={message.type === 'success' ? styles.successMessage : styles.errorMessage}>
                {message.text}
              </div>
            )}

            <div className={styles.buttonGroup}>
              <Button
                onClick={handleTestConnection}
                disabled={testing || !databaseUrl}
                variant="secondary"
              >
                {testing ? 'Testing...' : 'Test Connection'}
              </Button>
              <Button
                onClick={handleSaveSettings}
                disabled={loading || !databaseUrl}
              >
                {loading ? 'Saving...' : 'Save & Apply'}
              </Button>
              <Button
                onClick={handleClearSettings}
                variant="secondary"
              >
                Clear Settings
              </Button>
            </div>
          </div>
        </Card>

        <Card>
          <div className={styles.cardContent}>
            <h2 className={styles.sectionTitle}>How It Works</h2>
            <ul className={styles.instructionsList}>
              <li>Each user can configure their own database URL for their session</li>
              <li>The database URL is stored in your browser's local storage</li>
              <li>All API requests will use your configured database</li>
              <li>To set up a new Neon database, run the provided SQL script in your Neon console</li>
              <li>Multiple users can use the same app with different databases</li>
            </ul>
          </div>
        </Card>

        <Card>
          <div className={styles.cardContent}>
            <h2 className={styles.sectionTitle}>Setting Up Neon Database</h2>
            <ol className={styles.instructionsList}>
              <li>Create a new project in <a href="https://neon.tech" target="_blank" rel="noopener noreferrer">Neon</a></li>
              <li>Copy your database connection string</li>
              <li>Run the <code>neon-setup.sql</code> script in Neon's SQL Editor</li>
              <li>Paste your connection string above and test it</li>
              <li>Save and start using your database!</li>
            </ol>
          </div>
        </Card>
      </div>
    </div>
  );
}
