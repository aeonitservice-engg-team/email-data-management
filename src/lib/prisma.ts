import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client singleton for database access
 * 
 * NOTE: For multi-user support with different database URLs,
 * use createPrismaClient() from database-config.ts in API routes instead.
 * 
 * This singleton is kept for backward compatibility and uses
 * the DATABASE_URL environment variable if available.
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    datasources: {
      db: {
        url: process.env.DATABASE_URL || '',
      },
    },
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
