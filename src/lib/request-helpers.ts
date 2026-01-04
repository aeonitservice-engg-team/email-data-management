import { NextRequest } from 'next/server';
import { getPrismaClient } from './prisma-dynamic';

/**
 * Get database URL from request headers
 * Priority: x-database-url header > process.env.DATABASE_URL
 */
export function getDatabaseUrlFromRequest(request: NextRequest): string {
  const headerUrl = request.headers.get('x-database-url');
  return headerUrl || process.env.DATABASE_URL || '';
}

/**
 * Get Prisma client for the current request
 * Uses database URL from request headers if available
 */
export function getPrismaForRequest(request: NextRequest) {
  const databaseUrl = getDatabaseUrlFromRequest(request);
  return getPrismaClient(databaseUrl);
}

/**
 * Validate that a database URL is present
 */
export function validateDatabaseUrl(url: string): void {
  if (!url) {
    throw new Error('Database URL is not configured. Please set up your database in Settings.');
  }
}
