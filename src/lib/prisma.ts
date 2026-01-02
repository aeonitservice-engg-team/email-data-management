import { PrismaClient } from '@prisma/client';

/**
 * Prisma Client singleton for database access
 * Prevents multiple instances during hot-reload in development
 */

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
    // Optimize connection pooling for better performance
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  });

// Configure connection pool for MariaDB/MySQL
prisma.$connect();

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export default prisma;
