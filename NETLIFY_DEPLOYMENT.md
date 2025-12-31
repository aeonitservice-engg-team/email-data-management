# Deploying to Netlify with Neon Postgres

This guide will help you deploy your Email Data Management System on Netlify with Neon Postgres.

## Netlify vs Vercel: Which One to Choose?

### ✅ **Recommended: Vercel**
Vercel is the **better choice** for Next.js applications because:
- **Built by the Next.js team** - First-class Next.js support
- **Automatic optimizations** - Edge functions, ISR, image optimization work out of the box
- **Better DX** - Zero-config deployments for Next.js
- **Faster builds** - Optimized for Next.js build pipeline
- **Better cold starts** - Optimized serverless function warm-up

### Netlify Considerations
While Netlify is excellent for static sites, it has some limitations for Next.js:
- ⚠️ **Essential Next.js plugin required** - Need `@netlify/plugin-nextjs`
- ⚠️ **Limited SSR support** - Some Next.js features may not work as expected
- ⚠️ **Slower cold starts** - Serverless functions take longer to wake up
- ⚠️ **Build time limits** - Free tier has strict limits

## If You Still Choose Netlify

If you prefer Netlify for specific reasons (team requirements, existing infrastructure, etc.), here's how to deploy:

### Prerequisites

- A [Netlify](https://www.netlify.com) account
- A [Neon](https://neon.tech) account for PostgreSQL
- Your project pushed to GitHub/GitLab/Bitbucket

### Step 1: Set Up Neon Database

1. Go to [Neon Console](https://console.neon.tech)
2. Create a new project (e.g., "email-data-management")
3. Copy the **pooled connection string** - it looks like:
   ```
   postgresql://[user]:[password]@[host]/[database]?sslmode=require&pgbouncer=true
   ```

### Step 2: Prepare Your Project

1. Install the Netlify Next.js plugin:
   ```bash
   pnpm add -D @netlify/plugin-nextjs
   ```

2. Create `netlify.toml` in your project root:
   ```toml
   [build]
     command = "pnpm run build"
     publish = ".next"

   [[plugins]]
     package = "@netlify/plugin-nextjs"

   [functions]
     node_bundler = "esbuild"
     included_files = ["prisma/**", ".next/**"]

   [build.environment]
     NODE_VERSION = "20"
     NPM_FLAGS = "--legacy-peer-deps"
   ```

3. Update `package.json` to include Prisma generation in build:
   ```json
   {
     "scripts": {
       "build": "prisma generate && next build"
     }
   }
   ```

### Step 3: Deploy to Netlify

#### Option A: Deploy via Netlify UI (Recommended for First Time)

1. Go to [Netlify Dashboard](https://app.netlify.com)
2. Click **Add new site** > **Import an existing project**
3. Connect your Git provider (GitHub/GitLab/Bitbucket)
4. Select your repository
5. Configure build settings:
   - **Build command**: `pnpm run build`
   - **Publish directory**: `.next`
   - **Base directory**: (leave empty)

6. Add environment variables:
   - Click **Show advanced**
   - Add `DATABASE_URL` = Your Neon pooled connection string

7. Click **Deploy site**

#### Option B: Deploy via Netlify CLI

```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login
netlify login

# Initialize site
netlify init

# Set environment variable
netlify env:set DATABASE_URL "your-neon-connection-string"

# Deploy
netlify deploy --prod
```

### Step 4: Configure Environment Variables

In Netlify Dashboard:
1. Go to **Site settings** > **Environment variables**
2. Add the following:
   ```
   DATABASE_URL=postgresql://[pooled-connection-string]
   NEXT_PUBLIC_APP_NAME=Email Data Management
   NEXT_PUBLIC_APP_URL=https://your-site.netlify.app
   ```

### Step 5: Run Database Migrations

After first deployment, run migrations:

```bash
# Using local terminal (with DATABASE_URL set to production)
DATABASE_URL="your-production-url" pnpm prisma db push

# Or use Neon SQL Editor to run setup-db.sql manually
```

## Performance Optimization for Netlify

### 1. Connection Pooling

Always use Neon's pooled connection string with Netlify:
```
?sslmode=require&pgbouncer=true&connect_timeout=10
```

### 2. Update Prisma Configuration

Update `schema.prisma` for better connection management:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  directUrl = env("DIRECT_URL") // For migrations only
}
```

### 3. Function Timeout

Add to `netlify.toml`:
```toml
[functions]
  [functions."**"]
    timeout = 10
```

## Estimated Upload Time for 1000 Records

Based on the current implementation with chunking:

- **Chunk size**: 500 records per batch
- **Processing time**: ~50-100ms per record (includes validation + DB insert)
- **Network latency**: ~50-200ms per request to Neon

### Time Estimates:

| Records | Sequential Processing | Optimized (Chunks) | Notes |
|---------|----------------------|-------------------|-------|
| 100     | 5-10 seconds         | 5-10 seconds      | Single chunk |
| 500     | 25-50 seconds        | 25-50 seconds     | Single chunk |
| 1000    | 50-100 seconds       | **30-60 seconds** | 2 chunks of 500 |
| 5000    | 250-500 seconds      | 150-300 seconds   | 10 chunks |

**For 1000 records: Expect approximately 30-60 seconds** (about 1 minute)

### Optimization Tips for Faster Imports:

1. **Batch Inserts** (Recommended):
   ```typescript
   // Instead of individual creates, use createMany
   await prisma.emailContact.createMany({
     data: validContacts,
     skipDuplicates: true
   });
   ```
   This could reduce to **10-20 seconds** for 1000 records.

2. **Increase chunk size**:
   ```typescript
   const CHUNK_SIZE = 1000; // Instead of 500
   ```

3. **Use Neon's pooled connection** for better performance

4. **Pre-validate on client** to reduce failed insertions

## Troubleshooting Netlify Deployment

### Build Fails

**Error**: "Module not found: prisma"
```bash
# Solution: Ensure postinstall script runs
"postinstall": "prisma generate"
```

**Error**: "Function size too large"
```bash
# Solution: Exclude unnecessary files in netlify.toml
[functions]
  included_files = ["prisma/schema.prisma", ".next/**"]
  ignore = ["node_modules/**", ".git/**"]
```

### Runtime Errors

**Error**: "Database connection failed"
- Verify `DATABASE_URL` in Netlify environment variables
- Ensure you're using the pooled connection string
- Check Neon database is active

**Error**: "Function timeout"
- Increase timeout in `netlify.toml`
- Optimize database queries
- Use connection pooling

### Performance Issues

If imports are slow:
1. Check Neon database region (should be close to Netlify functions)
2. Use pooled connections
3. Implement batch inserts (see optimization tips above)
4. Monitor Netlify function logs for bottlenecks

## Why Vercel is Still Better

Despite successful Netlify deployment, consider Vercel for:
- ✅ **Faster serverless functions** - 30-50% better cold start times
- ✅ **Built-in Edge Runtime** - Middleware and edge functions
- ✅ **Automatic ISR** - Incremental Static Regeneration works perfectly
- ✅ **Better Next.js 16 support** - Turbopack, server actions, etc.
- ✅ **No plugin needed** - Zero configuration required

## Netlify-Specific Configuration Files

After following this guide, your project will have:
- ✅ `netlify.toml` - Netlify configuration
- ✅ `@netlify/plugin-nextjs` - Next.js adapter for Netlify
- ✅ Environment variables set in Netlify Dashboard
- ✅ Database migrations applied to Neon

## Next Steps

1. Test all API endpoints in production
2. Monitor function performance in Netlify Analytics
3. Set up custom domain (optional)
4. Configure SSL (automatic with Netlify)
5. Monitor database performance in Neon Console

## Cost Comparison

### Free Tier Limits:

**Netlify Free:**
- 300 build minutes/month
- 100GB bandwidth
- Unlimited sites

**Vercel Free:**
- 6000 build minutes/month
- 100GB bandwidth  
- Unlimited projects
- Better Next.js performance

**Recommendation**: Start with **Vercel** unless you have specific Netlify requirements.

## Support Resources

- [Netlify Next.js Documentation](https://docs.netlify.com/frameworks/next-js/overview/)
- [Neon Documentation](https://neon.tech/docs/introduction)
- [Next.js Deployment](https://nextjs.org/docs/deployment)
