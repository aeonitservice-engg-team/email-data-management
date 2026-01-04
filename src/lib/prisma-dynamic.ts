import { PrismaClient } from '@prisma/client';

/**
 * Dynamic Prisma Client Manager
 * Manages multiple Prisma client instances for different database URLs
 * Supports multi-tenant architecture where each user can have their own database
 */

// Cache for Prisma client instances to avoid creating duplicate connections
const prismaClients = new Map<string, PrismaClient>();

// Maximum number of concurrent database connections to cache
const MAX_CLIENTS = 10;

/**
 * Get or create a Prisma client for a specific database URL
 * @param databaseUrl - PostgreSQL connection string
 * @returns PrismaClient instance
 */
export function getPrismaClient(databaseUrl: string): PrismaClient {
  // Use default DATABASE_URL if none provided
  const url = databaseUrl || process.env.DATABASE_URL;
  
  if (!url) {
    throw new Error('Database URL is required. Please configure your database connection.');
  }

  // Return cached client if exists
  if (prismaClients.has(url)) {
    return prismaClients.get(url)!;
  }

  // Enforce max clients limit (LRU eviction)
  if (prismaClients.size >= MAX_CLIENTS) {
    const firstKey = prismaClients.keys().next().value;
    if (firstKey) {
      const oldClient = prismaClients.get(firstKey);
      oldClient?.$disconnect();
      prismaClients.delete(firstKey);
    }
  }

  // Create new Prisma client with the specific database URL
  const client = new PrismaClient({
    datasources: {
      db: {
        url,
      },
    },
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

  prismaClients.set(url, client);
  return client;
}

/**
 * Disconnect a specific Prisma client
 * @param databaseUrl - Database URL to disconnect
 */
export async function disconnectPrismaClient(databaseUrl: string): Promise<void> {
  const client = prismaClients.get(databaseUrl);
  if (client) {
    await client.$disconnect();
    prismaClients.delete(databaseUrl);
  }
}

/**
 * Disconnect all Prisma clients
 * Useful for graceful shutdown
 */
export async function disconnectAllClients(): Promise<void> {
  const disconnectPromises = Array.from(prismaClients.values()).map(client =>
    client.$disconnect()
  );
  await Promise.all(disconnectPromises);
  prismaClients.clear();
}

/**
 * Test database connection
 * @param databaseUrl - Database URL to test
 * @returns true if connection is successful
 */
export async function testDatabaseConnection(databaseUrl: string): Promise<boolean> {
  try {
    const client = new PrismaClient({
      datasources: {
        db: {
          url: databaseUrl,
        },
      },
    });
    
    // Test connection with a simple query
    await client.$queryRaw`SELECT 1`;
    await client.$disconnect();
    
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}

// Graceful shutdown handler
if (typeof process !== 'undefined') {
  process.on('beforeExit', async () => {
    await disconnectAllClients();
  });
}

export default getPrismaClient;
