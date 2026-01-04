'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { fetchGet } from '@/lib/fetch-with-db';

const STORAGE_KEY = 'app_stats_cache';

/**
 * Brand interface
 */
interface Brand {
  id: string;
  name: string;
  code: string;
  status?: 'ACTIVE' | 'INACTIVE';
  _count?: {
    journals: number;
  };
}

/**
 * Journal interface
 */
interface Journal {
  id: string;
  name: string;
  brandId: string;
  issn?: string | null;
  subject?: string | null;
  frequency?: string | null;
  status?: 'ACTIVE' | 'INACTIVE';
  brand: {
    id: string;
    name: string;
  };
  contactCount?: number;
}

/**
 * Cached data structure
 */
interface CachedData {
  brands: Brand[];
  journals: Journal[];
  emailCount: number;
  thisWeekCount: number;
  percentChange: number;
  monthlyData: Array<{ name: string; emails: number }>;
  timestamp: number;
}

/**
 * Data context state
 */
interface DataContextState {
  brands: Brand[];
  journals: Journal[];
  emailCount: number;
  loading: boolean;
  lastFetched: Date | null;
  fetchStats: () => Promise<void>;
  invalidateCache: () => void;
}

const DataContext = createContext<DataContextState>({
  brands: [],
  journals: [],
  emailCount: 0,
  loading: false,
  lastFetched: null,
  fetchStats: async () => {},
  invalidateCache: () => {},
});

export const useData = () => useContext(DataContext);

/**
 * Data Provider Component
 * 
 * Provides global access to brands, journals, and email count.
 * Data is fetched once and persisted in localStorage.
 */
export function DataProvider({ children }: { children: React.ReactNode }) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [emailCount, setEmailCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const cached = localStorage.getItem(STORAGE_KEY);
      if (cached) {
        const data: CachedData = JSON.parse(cached);
        setBrands(data.brands || []);
        setJournals(data.journals || []);
        setEmailCount(data.emailCount || 0);
        setLastFetched(new Date(data.timestamp));
      }
    } catch (error) {
      console.error('Failed to load cached data:', error);
    }
  }, []);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch only analytics which now includes brands and journals
      const response = await fetchGet('/api/analytics');

      if (!response.ok) {
        throw new Error('Failed to fetch analytics');
      }

      const analyticsData = await response.json();
      
      const newBrands: Brand[] = analyticsData.brands || [];
      const newJournals: Journal[] = analyticsData.journals || [];
      const newEmailCount = analyticsData.stats?.totalContacts || 0;

      setBrands(newBrands);
      setJournals(newJournals);
      setEmailCount(newEmailCount);

      const timestamp = Date.now();
      setLastFetched(new Date(timestamp));

      // Save to localStorage
      try {
        const cacheData: CachedData = {
          brands: newBrands,
          journals: newJournals,
          emailCount: newEmailCount,
          thisWeekCount: analyticsData.stats?.thisWeekCount || 0,
          percentChange: analyticsData.stats?.percentChange || 0,
          monthlyData: analyticsData.monthlyData || [],
          timestamp,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cacheData));
        // Also cache analytics separately for easy access
        localStorage.setItem('app_analytics_cache', JSON.stringify({
          thisWeekCount: cacheData.thisWeekCount,
          percentChange: cacheData.percentChange,
          monthlyData: cacheData.monthlyData,
        }));
      } catch (error) {
        console.error('Failed to cache data:', error);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const invalidateCache = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setBrands([]);
    setJournals([]);
    setEmailCount(0);
    setLastFetched(null);
  }, []);

  return (
    <DataContext.Provider
      value={{
        brands,
        journals,
        emailCount,
        loading,
        lastFetched,
        fetchStats,
        invalidateCache,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
