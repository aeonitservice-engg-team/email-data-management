# Quick Start Guide - Multi-Database Setup

## For End Users (Non-Technical)

### Step 1: Create Your Neon Database (5 minutes)

1. **Sign up for Neon** (it's free!)
   - Go to: https://neon.tech
   - Click "Sign up" and create an account
   - Verify your email

2. **Create a new project**
   - Click "Create Project"
   - Give it a name like "Email Contacts"
   - Choose a region close to you
   - Click "Create Project"

### Step 2: Set Up Your Database (3 minutes)

1. **Open SQL Editor**
   - In your Neon dashboard, click "SQL Editor" in the left sidebar
   
2. **Run the setup script**
   - Download the `neon-setup.sql` file from this repository
   - Open it in a text editor
   - Copy ALL the contents (Ctrl+A, then Ctrl+C)
   - Paste into the Neon SQL Editor
   - Click "Run" or press Ctrl+Enter
   - Wait for "Query completed successfully" message

3. **Verify setup**
   - Scroll down in the SQL Editor results
   - You should see 3 tables created: `brands`, `journals`, `email_contacts`

### Step 3: Get Your Connection String (1 minute)

1. **Find connection string**
   - In Neon dashboard, click on your project name
   - Look for "Connection string" section
   - Click "Copy" next to the connection string
   - It looks like: `postgresql://username:password@ep-xxx.neon.tech:5432/neondb?sslmode=require`

### Step 4: Configure the App (2 minutes)

1. **Open the Email Data Management app**
   - Go to the app URL (provided by your admin)
   
2. **Navigate to Settings**
   - Click "Settings" in the left sidebar
   
3. **Enter your database URL**
   - Paste the connection string you copied
   - Click "Test Connection"
   - Wait for "Connection successful" message
   - Click "Save & Apply"
   
4. **Refresh the page**
   - Your browser will now use YOUR database!

### Step 5: Start Using Your Database! 🎉

You can now:
- ✅ Create brands and journals
- ✅ Import email contacts from CSV
- ✅ Export your data anytime
- ✅ View analytics on your dashboard

**Your data is completely separate from other users!**

---

## For Developers

### Quick Deploy

```bash
# 1. Clone and install
git clone <repo-url>
cd email-data-management
pnpm install

# 2. Set up environment (optional - can use per-user config instead)
cp .env.example .env
# Edit .env if you want a default database

# 3. Run locally
pnpm dev

# 4. Users configure their own databases via Settings page
```

### Database Setup Options

**Option A: User-configured (Recommended)**
- Users set up their own Neon databases
- Configure via Settings page in the app
- No .env configuration needed

**Option B: Default database**
- Set `DATABASE_URL` in .env
- All users share one database (traditional)
- Users can still override with their own in Settings

### Key Features

```typescript
// All API routes automatically use user's configured database
import { getPrismaForRequest } from '@/lib/request-helpers';

export async function GET(request: NextRequest) {
  const prisma = getPrismaForRequest(request); // Gets user's DB
  const brands = await prisma.brand.findMany();
  return NextResponse.json({ brands });
}
```

### Architecture

- **Client**: Stores DB URL in localStorage
- **Requests**: Include DB URL in `x-database-url` header
- **Server**: Creates Prisma client dynamically per request
- **Caching**: Maintains pool of up to 10 DB connections

---

## Troubleshooting

### "Connection failed"
- ✅ Check your connection string format
- ✅ Ensure it ends with `?sslmode=require`
- ✅ Verify credentials are correct
- ✅ Check Neon project is running (not paused)

### "Database URL not configured"
- ✅ Go to Settings and add your database URL
- ✅ Or set `DATABASE_URL` in .env file

### "Tables not found"
- ✅ Run `neon-setup.sql` in Neon SQL Editor
- ✅ Verify tables were created using verification queries

### Can't see my data
- ✅ Refresh the page after saving settings
- ✅ Clear browser cache and localStorage
- ✅ Check you're using the correct database URL

---

## Security Notes

- 🔒 Database URLs are stored in browser localStorage
- 🔒 Transmitted over HTTPS (encrypted)
- 🔒 Each user has complete data isolation
- ⚠️ Don't share your connection string with others

For production deployments, consider:
- User authentication (NextAuth, Clerk, etc.)
- Server-side encrypted storage of DB URLs
- Database access controls and row-level security

---

## Support

Need help? Check:
1. [Multi-Database Configuration Guide](./MULTI_DATABASE_GUIDE.md)
2. [Main README](./README.md)
3. Neon documentation: https://neon.tech/docs
