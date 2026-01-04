/**
 * Database URL management
 * 
 * Multi-tenant support:
 * - Each user configures their own MySQL URL via Settings page
 * - URL stored in browser localStorage (client-side)
 * - Sent to API routes via X-Database-URL header
 * - Each request uses its own database connection
 */

import { PrismaClient } from '@prisma/client';

/**
 * Get database URL from request headers or environment
 * 
 * @param headers - Request headers (optional)
 * @returns Database URL string
 */
export function getDatabaseUrl(headers?: Headers): string {
  // Try to get from request header first (from Settings page via localStorage)
  if (headers) {
    const headerUrl = headers.get('x-database-url');
    if (headerUrl && headerUrl.trim()) {
      return headerUrl;
    }
  }

  // Fallback to environment variable
  const envUrl = process.env.DATABASE_URL;
  if (envUrl && envUrl.trim()) {
    return envUrl;
  }

  throw new Error(
    'No database URL configured. ' +
    'Please configure your MySQL connection in the Settings page.'
  );
}

/**
 * Create Prisma client with specific database URL
 * Use this in API routes to get a client for the current request
 * 
 * @param headers - Request headers containing X-Database-URL
 * @returns PrismaClient instance
 */
export function createPrismaClient(headers?: Headers): PrismaClient {
  const url = getDatabaseUrl(headers);
  
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url,
      },
    },
  });
}
