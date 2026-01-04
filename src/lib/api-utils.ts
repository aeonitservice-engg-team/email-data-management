/**
 * API Route Helpers
 * 
 * Utilities for handling multi-user database connections in API routes
 */

import { NextRequest } from 'next/server';
import { createPrismaClient } from './database-config';
import { PrismaClient } from '@prisma/client';

/**
 * Get Prisma client for the current request
 * Automatically extracts database URL from X-Database-URL header
 * 
 * Usage in API routes:
 * ```typescript
 * import { getPrismaForRequest } from '@/lib/api-utils';
 * 
 * export async function GET(request: NextRequest) {
 *   const prisma = getPrismaForRequest(request);
 *   const data = await prisma.brand.findMany();
 *   await prisma.$disconnect();
 *   return NextResponse.json(data);
 * }
 * ```
 */
export function getPrismaForRequest(request: NextRequest): PrismaClient {
  return createPrismaClient(request.headers);
}

/**
 * Execute a database operation with automatic connection management
 * Ensures Prisma client is properly disconnected after use
 * 
 * Usage:
 * ```typescript
 * export async function GET(request: NextRequest) {
 *   return withDatabase(request, async (prisma) => {
 *     const brands = await prisma.brand.findMany();
 *     return NextResponse.json(brands);
 *   });
 * }
 * ```
 */
export async function withDatabase<T>(
  request: NextRequest,
  operation: (prisma: PrismaClient) => Promise<T>
): Promise<T> {
  const prisma = createPrismaClient(request.headers);
  try {
    return await operation(prisma);
  } finally {
    await prisma.$disconnect();
  }
}
