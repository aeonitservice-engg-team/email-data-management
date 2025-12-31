'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { Header } from '@/components/layout';
import { Button, Card, CardHeader, CardContent, Select, Spinner, useToast } from '@/components/ui';
import styles from './page.module.css';

/**
 * Brand interface
 */
interface Brand {
  id: string;
  name: string;
  code: string;
}

/**
 * Journal interface for dropdown
 */
interface Journal {
  id: string;
  name: string;
  brandId: string;
  brand: {
    id: string;
    name: string;
  };
}

/**
 * Import summary interface
 */
interface ImportSummary {
  total: number;
  imported: number;
  duplicates: number;
  errors: number;
  errorDetails: string[];
}

/**
 * Import Page
 * 
 * Upload and import CSV files containing email contacts.
 */
export default function ImportPage() {
  const { addToast } = useToast();
  const [brands, setBrands] = useState<Brand[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [filteredJournals, setFilteredJournals] = useState<Journal[]>([]);
  const [selectedBrand, setSelectedBrand] = useState('');
  const [selectedJournal, setSelectedJournal] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [summary, setSummary] = useState<ImportSummary | null>(null);

  /**
   * Fetch brands on mount
   */
  useEffect(() => {
    async function fetchBrands() {
      try {
        const response = await fetch('/api/brands?limit=100');
        if (response.ok) {
          const data = await response.json();
          setBrands(data.brands);
        }
      } catch (error) {
        console.error('Failed to fetch brands:', error);
      }
    }
    fetchBrands();
  }, []);

  /**
   * Fetch journals for dropdown
   */
  useEffect(() => {
    async function fetchJournals() {
      try {
        const response = await fetch('/api/journals?limit=100');
        if (response.ok) {
          const data = await response.json();
          setJournals(data.journals);
        }
      } catch (error) {
        console.error('Failed to fetch journals:', error);
      }
    }
    fetchJournals();
  }, []);

  /**
   * Filter journals when brand changes
   */
  useEffect(() => {
    if (selectedBrand) {
      const filtered = journals.filter(j => j.brandId === selectedBrand);
      setFilteredJournals(filtered);
      // Reset journal selection if it's not in the filtered list
      if (selectedJournal && !filtered.find(j => j.id === selectedJournal)) {
        setSelectedJournal('');
      }
    } else {
      setFilteredJournals([]);
      setSelectedJournal('');
    }
  }, [selectedBrand, journals, selectedJournal]);

  /**
   * Handle file drop
   */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile && droppedFile.name.endsWith('.csv')) {
      setFile(droppedFile);
      setSummary(null);
    } else {
      addToast('Please upload a CSV file', 'error');
    }
  }, [addToast]);

  /**
   * Handle file selection
   */
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile);
      setSummary(null);
    } else {
      addToast('Please upload a CSV file', 'error');
    }
  }, [addToast]);

  /**
   * Handle file upload
   */
  const handleUpload = async () => {
    if (!file) {
      addToast('Please select a file to upload', 'error');
      return;
    }

    if (!selectedBrand || !selectedJournal) {
      addToast('Please select both brand and journal', 'error');
      return;
    }

    // Validate file size
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      addToast('File size must be less than 10MB', 'error');
      return;
    }

    setIsUploading(true);
    setSummary(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('journalId', selectedJournal);

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Import failed');
      }

      setSummary(data.summary);
      addToast(`Successfully imported ${data.summary.imported} contacts`, 'success');
    } catch (error) {
      addToast(error instanceof Error ? error.message : 'Import failed', 'error');
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Clear selected file
   */
  const handleClear = () => {
    setFile(null);
    setSummary(null);
  };

  return (
    <>
      <Header
        title="Import CSV"
        description="Upload a CSV file to import email contacts"
      />

      <div className={styles.container}>
        {/* Upload Card */}
        <Card>
          <CardHeader title="Upload CSV File" />
          <CardContent>
            {/* Brand Selection */}
            <div className={styles.journalSelect}>
              <Select
                label="Select Brand *"
                options={[
                  { value: '', label: 'Choose a brand...' },
                  ...brands.map((b) => ({ value: b.id, label: `${b.name} (${b.code})` })),
                ]}
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                helperText="Select the brand for your email contacts"
                fullWidth
                required
              />
            </div>

            {/* Journal Selection */}
            <div className={styles.journalSelect}>
              <Select
                label="Select Journal *"
                options={[
                  { value: '', label: selectedBrand ? 'Choose a journal...' : 'Select a brand first' },
                  ...filteredJournals.map((j) => ({ value: j.id, label: j.name })),
                ]}
                value={selectedJournal}
                onChange={(e) => setSelectedJournal(e.target.value)}
                helperText="Select the journal where contacts will be imported"
                fullWidth
                required
                disabled={!selectedBrand}
              />
            </div>

            {/* Drop Zone */}
            <div
              className={`${styles.dropZone} ${isDragging ? styles.dragging : ''} ${file ? styles.hasFile : ''}`}
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <input
                id="file-input"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className={styles.fileInput}
              />
              {file ? (
                <div className={styles.fileInfo}>
                  <svg className={styles.fileIcon} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <p className={styles.fileName}>{file.name}</p>
                  <p className={styles.fileSize}>{(file.size / 1024).toFixed(1)} KB</p>
                </div>
              ) : (
                <div className={styles.dropContent}>
                  <svg className={styles.uploadIcon} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>
                  <p className={styles.dropText}>
                    Drag and drop your CSV file here, or click to browse
                  </p>
                  <p className={styles.dropHint}>Maximum file size: 10MB</p>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              {file && (
                <Button variant="ghost" onClick={handleClear}>
                  Clear
                </Button>
              )}
              <Button
                onClick={handleUpload}
                isLoading={isUploading}
                disabled={!file || !selectedBrand || !selectedJournal}
              >
                {isUploading ? 'Importing...' : 'Import'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Summary Card */}
        {summary && (
          <Card>
            <CardHeader title="Import Summary" />
            <CardContent>
              <div className={styles.summary}>
                <div className={styles.summaryItem}>
                  <span className={styles.summaryLabel}>Total Rows</span>
                  <span className={styles.summaryValue}>{summary.total}</span>
                </div>
                <div className={`${styles.summaryItem} ${styles.success}`}>
                  <span className={styles.summaryLabel}>Imported</span>
                  <span className={styles.summaryValue}>{summary.imported}</span>
                </div>
                <div className={`${styles.summaryItem} ${styles.warning}`}>
                  <span className={styles.summaryLabel}>Duplicates Skipped</span>
                  <span className={styles.summaryValue}>{summary.duplicates}</span>
                </div>
                <div className={`${styles.summaryItem} ${styles.error}`}>
                  <span className={styles.summaryLabel}>Errors</span>
                  <span className={styles.summaryValue}>{summary.errors}</span>
                </div>
              </div>

              {summary.errorDetails.length > 0 && (
                <div className={styles.errorDetails}>
                  <p className={styles.errorTitle}>Error Details:</p>
                  <ul className={styles.errorList}>
                    {summary.errorDetails.map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Instructions Card */}
        <Card>
          <CardHeader title="CSV Format Requirements" />
          <CardContent>
            <div className={styles.instructions}>
              <h4>Required Columns:</h4>
              <ul>
                <li><code>name</code> - Contact name</li>
                <li><code>email</code> - Email address</li>
              </ul>

              <h4>Optional Columns:</h4>
              <ul>
                <li><code>phone</code> - Phone number</li>
                <li><code>article_title</code> - Article or publication title</li>
                <li><code>year</code> - Year of data collection (e.g., 2024)</li>
              </ul>

              <h4>Example CSV:</h4>
              <pre className={styles.codeBlock}>
{`name,email,phone,article_title,year
John Doe,john@example.com,+1234567890,Best Practices in AI,2024
Jane Smith,jane@example.com,,Machine Learning Fundamentals,2025`}
              </pre>

              <h4>Notes:</h4>
              <ul>
                <li>Maximum file size is 10MB</li>
                <li>You must select a brand and journal before importing</li>
                <li>Duplicate emails within the same journal will be skipped</li>
                <li>Same email can exist in different journals</li>
                <li>Rows with missing name or email will be skipped</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
