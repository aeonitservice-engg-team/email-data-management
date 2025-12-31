'use client';

import React, { useEffect, useState } from 'react';
import { StatCard, EmailsBarChart, BrandPieChart, TrendLineChart } from '@/components/dashboard';
import { Card, CardHeader, CardContent, Spinner, Badge, Button } from '@/components/ui';
import { useData } from '@/contexts/DataContext';
import { formatNumber } from '@/lib/utils';
import styles from './page.module.css';

/**
 * Analytics data interface
 */
interface AnalyticsData {
  stats: {
    totalContacts: number;
    totalJournals: number;
    activeJournals: number;
    thisWeekCount: number;
    percentChange: number;
  };
  brandData: Array<{ name: string; value: number }>;
  monthlyData: Array<{ name: string; emails: number }>;
  topJournals: Array<{ name: string; emails: number; brand: string }>;
}

/**
 * Dashboard Content component
 * 
 * Client-side component for fetching and displaying dashboard data.
 */
export function DashboardContent() {
  const { brands, journals, emailCount, loading: statsLoading, lastFetched, fetchStats } = useData();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-fetch stats on mount if no data exists
  useEffect(() => {
    if (!lastFetched && !statsLoading) {
      fetchStats();
    }
  }, [lastFetched, statsLoading, fetchStats]);

  useEffect(() => {
    async function fetchAnalytics() {
      try {
        const response = await fetch('/api/analytics');
        if (!response.ok) {
          throw new Error('Failed to fetch analytics');
        }
        const result = await response.json();
        setData(result);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchAnalytics();
  }, []);

  if (loading) {
    return (
      <div className={styles.loading}>
        <Spinner size="lg" />
        <p>Loading dashboard...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <div className={styles.dashboard}>
      {/* Stats Grid */}
      <div className={styles.statsGrid}>
        <StatCard
          title="Total Emails"
          value={data.stats.totalContacts}
          icon={
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          }
          change={data.stats.percentChange}
          variant="primary"
        />
        <StatCard
          title="Total Journals"
          value={data.stats.totalJournals}
          icon={
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          }
          variant="secondary"
        />
        <StatCard
          title="Active Journals"
          value={data.stats.activeJournals}
          icon={
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
          variant="success"
        />
        <StatCard
          title="This Week"
          value={data.stats.thisWeekCount}
          icon={
            <svg fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
          }
          variant="warning"
        />
      </div>

      {/* Charts Row */}
      <div className={styles.chartsGrid}>
        <div className={styles.chartLarge}>
          <TrendLineChart data={data.monthlyData} title="Email Collection Trend" />
        </div>
        <div className={styles.chartSmall}>
          <BrandPieChart data={data.brandData} title="Emails by Brand" />
        </div>
      </div>

      {/* Bottom Row */}
      <div className={styles.bottomGrid}>
        <div className={styles.chartLarge}>
          <EmailsBarChart
            data={data.topJournals.map((j) => ({ name: j.name, emails: j.emails }))}
            title="Top Journals by Email Count"
          />
        </div>
        <div className={styles.chartSmall}>
          <Card>
            <CardHeader title="Top Journals" />
            <CardContent>
              <div className={styles.topJournalsList}>
                {data.topJournals.map((journal, index) => (
                  <div key={index} className={styles.topJournalItem}>
                    <div className={styles.journalInfo}>
                      <span className={styles.journalRank}>{index + 1}</span>
                      <div>
                        <p className={styles.journalName}>{journal.name}</p>
                        <Badge variant={index % 2 === 0 ? 'primary' : 'secondary'}>
                          {journal.brand}
                        </Badge>
                      </div>
                    </div>
                    <span className={styles.journalCount}>{formatNumber(journal.emails)}</span>
                  </div>
                ))}
                {data.topJournals.length === 0 && (
                  <p className={styles.emptyMessage}>No journals yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
