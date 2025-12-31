'use client';

import React from 'react';
import { Button } from '@/components/ui';
import { useData } from '@/contexts/DataContext';

/**
 * Fetch Stats Button Component
 * 
 * Button to manually refresh brands, journals, and email count data.
 */
export function FetchStatsButton() {
  const { loading, lastFetched, fetchStats } = useData();

  return (
    <Button
      onClick={fetchStats}
      disabled={loading}
      variant="primary"
    >
      {loading ? 'Fetching...' : lastFetched ? 'Refresh Stats' : 'Fetch Stats'}
    </Button>
  );
}
