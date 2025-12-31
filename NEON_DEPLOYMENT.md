# Deploying to Neon Postgres

This guide will help you deploy your Email Data Management System with Neon Postgres.

## Prerequisites

- A [Neon](https://neon.tech) account (free tier available)
- Your application code ready to deploy

## Step 1: Create a Neon Database

1. Go to [Neon Console](https://console.neon.tech)
2. Click **Create Project** or **New Project**
3. Choose a project name (e.g., "email-data-management")
4. Select your preferred region
5. Click **Create Project**

## Step 2: Get Your Database Connection String

1. After creating the project, you'll see your connection string
2. Copy the connection string - it should look like:
   ```
   postgresql://[user]:[password]@[host]/[database]?sslmode=require
   ```
3. Neon provides a pooled connection string as well - use the **pooled** connection for better performance with serverless

## Step 3: Configure Environment Variables

### For Local Development

1. Create a `.env` file in your project root (if not exists):
   ```bash
   cp .env.example .env
   ```

2. Update the `DATABASE_URL` in `.env`:
   ```env
   DATABASE_URL="your-neon-connection-string-here"
   ```

### For Production/Vercel Deployment

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add `DATABASE_URL` with your Neon connection string
4. Make sure to use the **pooled connection string** for better serverless performance

## Step 4: Run Database Migrations

### Using Prisma Migrate (Recommended)

```bash
# Generate Prisma Client
pnpm db:generate

# Push the schema to your Neon database
pnpm db:push

# Or use migrations (for production)
pnpm db:migrate
```

### Manual Setup (if needed)

If you need to run the SQL setup manually:

```bash
# Copy the setup-db.sql content and run it in Neon SQL Editor
```

## Step 5: Verify Database Connection

Test your connection locally:

```bash
pnpm run dev
```

Visit `http://localhost:3000` and check if the app connects successfully.

## Step 6: Deploy to Vercel (Optional)

### Install Vercel CLI

```bash
npm i -g vercel
```

### Deploy

```bash
# Login to Vercel
vercel login

# Deploy
vercel

# Or deploy to production
vercel --prod
```

### Configure Environment Variables in Vercel

1. Go to your project on [Vercel Dashboard](https://vercel.com/dashboard)
2. Click on **Settings** > **Environment Variables**
3. Add the following:
   - `DATABASE_URL` = Your Neon connection string (use pooled connection)

## Neon-Specific Optimizations

### 1. Use Connection Pooling

Neon provides built-in connection pooling. Use the pooled connection string:

```
postgresql://[user]:[password]@[host]/[database]?sslmode=require&pgbouncer=true
```

### 2. Update Prisma Configuration

The current `schema.prisma` is already configured for PostgreSQL. If you need connection pooling, you can optionally add:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // Optional: for migrations
}
```

Then in your `.env`:
```env
DATABASE_URL="postgresql://[pooled-connection]"
DIRECT_URL="postgresql://[direct-connection]"
```

### 3. Optimize Prisma Client

The `postinstall` script in `package.json` already handles Prisma Client generation:

```json
"postinstall": "prisma generate"
```

## Monitoring and Maintenance

### Neon Console Features

- **Metrics**: Monitor database performance
- **Branches**: Create database branches for development
- **Backups**: Automatic daily backups
- **Autoscaling**: Automatic scale to zero when inactive

### Check Connection

```bash
# Test Prisma connection
npx prisma db pull
```

## Troubleshooting

### Connection Issues

1. **SSL Error**: Make sure your connection string includes `?sslmode=require`
2. **Connection Timeout**: Use the pooled connection string for serverless environments
3. **Permission Denied**: Verify your credentials in the Neon console

### Migration Issues

```bash
# Reset the database (development only!)
pnpm prisma migrate reset

# Force push schema
pnpm prisma db push --force-reset
```

### Vercel Deployment Issues

1. Make sure environment variables are set correctly
2. Check build logs for any Prisma generation errors
3. Ensure `postinstall` script runs during build

## Database Branches (Optional)

Neon supports database branching for development:

```bash
# Create a branch in Neon Console
# Update your .env with the branch connection string
# Develop and test without affecting production
```

## Cost Optimization

- **Free Tier**: Neon offers a generous free tier
- **Autoscaling**: Database automatically scales to zero when not in use
- **Branching**: Use branches instead of separate databases for development

## Security Best Practices

1. Never commit `.env` files to git
2. Use environment variables for all sensitive data
3. Rotate database credentials periodically
4. Use connection pooling for better resource management
5. Enable SSL for all connections (default with Neon)

## Next Steps

After deployment:

1. Verify all API endpoints work correctly
2. Test CSV import/export functionality
3. Monitor database performance in Neon Console
4. Set up database backups (automatic in Neon)
5. Consider setting up a staging branch in Neon

## Support

- [Neon Documentation](https://neon.tech/docs/introduction)
- [Prisma Documentation](https://www.prisma.io/docs/)
- [Vercel Documentation](https://vercel.com/docs)
