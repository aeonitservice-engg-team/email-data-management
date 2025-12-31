'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';

/**
 * Brand interface
 */
interface Brand {
  id: string;
  name: string;
  code: string;
}

/**
 * Journal interface
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
 * Data context state
 */
interface DataContextState {
  brands: Brand[];
  journals: Journal[];
  emailCount: number;
  loading: boolean;
  lastFetched: Date | null;
  fetchStats: () => Promise<void>;
}

const DataContext = createContext<DataContextState>({
  brands: [],
  journals: [],
  emailCount: 0,
  loading: false,
  lastFetched: null,
  fetchStats: async () => {},
});

export const useData = () => useContext(DataContext);

/**
 * Data Provider Component
 * 
 * Provides global access to brands, journals, and email count.
 * Data is fetched once and reused across all pages.
 */
export function DataProvider({ children }: { children: React.ReactNode }) {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [journals, setJournals] = useState<Journal[]>([]);
  const [emailCount, setEmailCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all data in parallel
      const [brandsRes, journalsRes, analyticsRes] = await Promise.all([
        fetch('/api/brands?limit=100'),
        fetch('/api/journals?limit=100'),
        fetch('/api/analytics'),
      ]);

      if (brandsRes.ok) {
        const brandsData = await brandsRes.json();
        setBrands(brandsData.brands || []);
      }

      if (journalsRes.ok) {
        const journalsData = await journalsRes.json();
        setJournals(journalsData.journals || []);
      }

      if (analyticsRes.ok) {
        const analyticsData = await analyticsRes.json();
        setEmailCount(analyticsData.totalContacts || 0);
      }

      setLastFetched(new Date());
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
    }
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
      }}
    >
      {children}
    </DataContext.Provider>
  );
}
