# Multi-Database Configuration Guide

## Overview

This Email Data Management application now supports **dynamic database URLs**, allowing multiple users to connect to their own PostgreSQL/Neon databases. Each user can configure their own database connection, making this a true multi-tenant application.

## How It Works

### Architecture

1. **Database URL Storage**: Each user's database connection string is stored in their browser's `localStorage`
2. **Dynamic Connections**: The app creates Prisma client instances dynamically based on the configured database URL
3. **Request Headers**: All API requests automatically include the database URL via the `x-database-url` header
4. **Connection Pooling**: The app maintains a cache of up to 10 database connections for performance

### Key Components

- **`src/lib/prisma-dynamic.ts`**: Manages dynamic Prisma client creation
- **`src/lib/request-helpers.ts`**: Extracts database URLs from requests
- **`src/lib/fetch-with-db.ts`**: Client-side fetch wrapper that includes database URL
- **`src/app/settings/`**: Settings page for database configuration
- **`src/app/api/settings/database/`**: API for testing and validating connections

## Setup Instructions

### For End Users

#### Option 1: Using Neon (Recommended)

1. **Create a Neon Account**
   - Go to [https://neon.tech](https://neon.tech)
   - Sign up for a free account
   - Create a new project

2. **Run the Setup SQL**
   - Open the SQL Editor in your Neon dashboard
   - Copy the contents of `neon-setup.sql` from this repository
   - Paste and execute the entire script in the SQL Editor
   - Verify that all tables were created successfully

3. **Get Your Connection String**
   - In Neon dashboard, go to your project settings
   - Copy the connection string (it looks like):
     ```
     postgresql://username:password@ep-xxx.us-east-2.aws.neon.tech:5432/neondb?sslmode=require
     ```

4. **Configure the App**
   - Open the Email Data Management app
   - Navigate to **Settings** (in the sidebar)
   - Paste your connection string
   - Click **Test Connection** to verify it works
   - Click **Save & Apply**
   - Refresh the page

5. **Start Using Your Database**
   - All your data will now be stored in your personal Neon database
   - You can create brands, journals, and import contacts

#### Option 2: Using Other PostgreSQL Providers

You can use any PostgreSQL provider:
- **Supabase**: https://supabase.com
- **Railway**: https://railway.app
- **Heroku Postgres**: https://www.heroku.com/postgres
- **Self-hosted PostgreSQL**

Steps:
1. Create a PostgreSQL database with your provider
2. Run the `neon-setup.sql` script in your database
3. Get your connection string
4. Configure it in the app Settings

### For Developers/Deployers

#### Environment Variables

The app supports a default database URL via environment variables:

```env
# .env.local
DATABASE_URL="postgresql://username:password@host:5432/database?sslmode=require"
```

If no user-specific database URL is configured, the app will fall back to this default.

#### Database Setup Files

- **`neon-setup.sql`**: Complete database setup script for Neon or any PostgreSQL database
  - Creates all tables, indexes, constraints
  - Idempotent (safe to run multiple times)
  - Includes verification queries

- **`setup-db.sql`**: Legacy setup file (kept for reference)

- **`prisma/schema.prisma`**: Prisma schema definition
  - Used for type generation
  - Can generate migrations with `npx prisma migrate dev`

#### Running Migrations

If you prefer using Prisma migrations instead of the SQL file:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (for prototyping)
npm run db:push

# Create and run migrations (for production)
npm run db:migrate
```

## API Request Flow

### How Database URLs are Passed

1. **Client-side**:
   ```typescript
   import { fetchGet, fetchPost } from '@/lib/fetch-with-db';
   
   // Automatically includes database URL from localStorage
   const response = await fetchGet('/api/brands');
   const data = await fetchPost('/api/brands', { name: 'Test' });
   ```

2. **Server-side** (API routes):
   ```typescript
   import { getPrismaForRequest } from '@/lib/request-helpers';
   
   export async function GET(request: NextRequest) {
     // Gets Prisma client configured for user's database
     const prisma = getPrismaForRequest(request);
     
     const brands = await prisma.brand.findMany();
     return NextResponse.json({ brands });
   }
   ```

### Request Header Format

All API requests include:
```
x-database-url: postgresql://username:password@host:5432/database?sslmode=require
```

If no header is present, the app uses `process.env.DATABASE_URL`.

## Security Considerations

### Current Implementation

- Database URLs are stored in browser `localStorage`
- URLs are transmitted via HTTPS (encrypted in transit)
- Connection strings include credentials

### Recommendations for Production

1. **Use Connection Pooling**: Configure PgBouncer or similar
2. **Implement User Authentication**: Add auth layer (e.g., NextAuth, Clerk)
3. **Store URLs Server-side**: Store encrypted connection strings in a secure database
4. **Use Database Proxy**: Consider services like Prisma Data Proxy
5. **Row-Level Security**: Implement RLS in PostgreSQL for additional protection
6. **Environment Isolation**: Use separate databases for dev/staging/production

### Enhanced Security Pattern (Future Implementation)

```typescript
// Store database URLs encrypted server-side
interface UserDatabaseMapping {
  userId: string;
  encryptedDatabaseUrl: string;
  createdAt: Date;
}

// Retrieve based on authenticated user session
export async function GET(request: NextRequest) {
  const session = await getSession(request);
  const dbUrl = await getDecryptedDatabaseUrl(session.userId);
  const prisma = getPrismaClient(dbUrl);
  // ...
}
```

## Troubleshooting

### Connection Issues

**Problem**: "Database connection failed"

**Solutions**:
1. Verify your connection string format is correct
2. Ensure your database allows connections from the app's IP
3. Check that SSL mode is set correctly (`?sslmode=require` for Neon)
4. Verify database credentials are correct

**Problem**: "Database URL is not configured"

**Solutions**:
1. Go to Settings and configure your database URL
2. Or set `DATABASE_URL` environment variable for default connection

### Performance Issues

**Problem**: Slow database queries

**Solutions**:
1. Run the `neon-setup.sql` script to ensure all indexes are created
2. Check Neon/database dashboard for connection limits
3. Monitor connection pool usage

### Data Not Appearing

**Problem**: Can't see my data after configuring database

**Solutions**:
1. Refresh the page after saving settings
2. Clear browser cache and localStorage
3. Verify you're using the correct database URL
4. Check the Neon SQL Editor to confirm data exists in your database

## Migration from Single Database

If you're upgrading from a single-database setup:

1. **Backup your current data**: Export all contacts via Export CSV
2. **Note your current DATABASE_URL**: Save it as the default
3. **Update your code**: Pull latest changes
4. **Configure databases**:
   - Option A: Keep using default DATABASE_URL (no configuration needed)
   - Option B: Add URL in Settings page for user-specific databases
5. **Import data**: Use Import CSV to restore data if needed

## Technical Architecture

### Connection Management

```typescript
// Connection pool with LRU eviction
const prismaClients = new Map<string, PrismaClient>();
const MAX_CLIENTS = 10;

// Get or create client
export function getPrismaClient(databaseUrl: string): PrismaClient {
  if (prismaClients.has(url)) {
    return prismaClients.get(url)!;
  }
  
  // Create new client with specific URL
  const client = new PrismaClient({
    datasources: { db: { url } }
  });
  
  prismaClients.set(url, client);
  return client;
}
```

### Client-Server Communication

```
┌─────────────┐
│   Browser   │
│             │
│  Settings   │──┐
│  localStorage│  │
│  - db_url   │  │
└─────────────┘  │
                  │
                  ▼
┌─────────────────────────────────┐
│  HTTP Request                   │
│  Header: x-database-url         │
└─────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────┐
│  API Route (Next.js)            │
│  - getPrismaForRequest()        │
│  - Extract database URL         │
└─────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────┐
│  Dynamic Prisma Client          │
│  - Create/reuse connection      │
│  - Execute queries              │
└─────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────┐
│  PostgreSQL Database            │
│  (Neon, Supabase, etc.)         │
└─────────────────────────────────┘
```

## Future Enhancements

Potential improvements:

1. **User Authentication**: Proper login/signup flow
2. **Database Management UI**: Create/delete databases from UI
3. **Team Collaboration**: Share database access with team members
4. **Backup & Restore**: Automated backup scheduling
5. **Database Metrics**: Show connection stats, query performance
6. **Multi-region Support**: Database selection by region
7. **Schema Versioning**: Automatic migration management

## Support

For issues or questions:
1. Check this documentation
2. Review `neon-setup.sql` verification queries
3. Check browser console for errors
4. Verify database connection in Neon/provider dashboard

## License

Same as main project license.
