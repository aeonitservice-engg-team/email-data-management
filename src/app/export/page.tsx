'use client';

import React, { useState, useEffect } from 'react';
import { Header } from '@/components/layout';
import { Button, Card, CardHeader, CardContent, Input, Select, useToast } from '@/components/ui';
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
  brand: string;
}

/**
 * Export Page
 * 
 * Export email contacts to CSV with filters.
 */
export default function ExportPage() {
  const { addToast } = useToast();
  const [journals, setJournals] = useState<Journal[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  // Filter states
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [journalId, setJournalId] = useState('');
  const [brandId, setBrandId] = useState('');

  /**
   * Fetch brands and journals for dropdowns
   */
  useEffect(() => {
    async function fetchData() {
      try {
        // Fetch brands
        const brandsResponse = await fetch('/api/brands?status=ACTIVE');
        if (brandsResponse.ok) {
          const brandsData = await brandsResponse.json();
          setBrands(brandsData.brands);
        }

        // Fetch journals
        const journalsResponse = await fetch('/api/journals?limit=100');
        if (journalsResponse.ok) {
          const journalsData = await journalsResponse.json();
          setJournals(journalsData.journals);
        }
      } catch (error) {
        console.error('Failed to fetch data:', error);
      }
    }
    fetchData();
  }, []);

  /**
   * Handle export
   */
  const handleExport = async () => {
    setIsExporting(true);

    try {
      const params = new URLSearchParams();
      if (startDate) params.set('startDate', startDate);
      if (endDate) params.set('endDate', endDate);
      if (journalId) params.set('journalId', journalId);
      if (brandId) params.set('brandId', brandId);

      const response = await fetch(`/api/export?${params}`);

      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Get filename from Content-Disposition header or use default
      const contentDisposition = response.headers.get('Content-Disposition');
      let filename = `email-contacts-${new Date().toISOString().split('T')[0]}.csv`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="(.+)"/);
        if (match) {
          filename = match[1];
        }
      }

      // Download the file
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      addToast('Export completed successfully', 'success');
    } catch (error) {
      addToast('Failed to export contacts', 'error');
    } finally {
      setIsExporting(false);
    }
  };

  /**
   * Clear all filters
   */
  const handleClearFilters = () => {
    setStartDate('');
    setEndDate('');
    setJournalId('');
    setBrandId('');
  };

  return (
    <>
      <Header
        title="Export CSV"
        description="Export email contacts to a CSV file"
      />

      <div className={styles.container}>
        {/* Filters Card */}
        <Card>
          <CardHeader
            title="Export Filters"
            description="Apply filters to export specific contacts"
          />
          <CardContent>
            <div className={styles.filtersGrid}>
              {/* Date Range */}
              <Input
                label="Start Date"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                fullWidth
              />
              <Input
                label="End Date"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                fullWidth
              />

              {/* Journal Filter */}
              <Select
                label="Journal"
                options={[
                  { value: '', label: 'All Journals' },
                  ...journals.map((j) => ({ value: j.id, label: j.name })),
                ]}
                value={journalId}
                onChange={(e) => setJournalId(e.target.value)}
                fullWidth
              />

              {/* Brand Filter */}
              <Select
                label="Brand"
                options={[
                  { value: '', label: 'All Brands' },
                  ...brands.map((b) => ({ value: b.id, label: b.name })),
                ]}
                value={brandId}
                onChange={(e) => setBrandId(e.target.value)}
                fullWidth
              />
            </div>

            {/* Actions */}
            <div className={styles.actions}>
              <Button variant="ghost" onClick={handleClearFilters}>
                Clear Filters
              </Button>
              <Button onClick={handleExport} isLoading={isExporting}>
                <svg className={styles.downloadIcon} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3" />
                </svg>
                {isExporting ? 'Exporting...' : 'Export CSV'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Export Info Card */}
        <Card>
          <CardHeader title="Export Information" />
          <CardContent>
            <div className={styles.info}>
              <h4>Exported CSV Columns:</h4>
              <ul>
                <li><code>name</code> - Contact name</li>
                <li><code>email</code> - Email address</li>
                <li><code>phone</code> - Phone number</li>
                <li><code>article_title</code> - Article or publication title</li>
                <li><code>brand</code> - Brand name</li>
                <li><code>created_at</code> - Date when contact was added</li>
              </ul>

              <h4>Tips:</h4>
              <ul>
                <li>Leave all filters empty to export all contacts</li>
                <li>Use date filters to export contacts from a specific time period</li>
                <li>Filter by journal or brand to export specific subsets</li>
                <li>Exports complete quickly, typically within 3 seconds</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
