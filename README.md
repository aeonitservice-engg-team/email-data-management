# Email Data Management System

A modern, full-stack Next.js application for managing email contacts collected for academic journal marketing campaigns. Built with TypeScript, Tailwind CSS, and PostgreSQL.

## 🎯 New Feature: Multi-Database Support

**The app now supports dynamic database URLs!** Each user can configure their own PostgreSQL/Neon database connection, making this a true multi-tenant application.

- ⚙️ **Settings Page**: Configure your own database URL
- 🔗 **Dynamic Connections**: Connect to any PostgreSQL/Neon database
- 👥 **Multi-User Ready**: Different users can use different databases
- 📝 **Easy Setup**: One SQL file to set up your entire database

📖 **[Read the Multi-Database Configuration Guide →](./MULTI_DATABASE_GUIDE.md)**

## Features

- 📊 **Dashboard Analytics** - Real-time statistics and charts showing email collection trends
- 🏷️ **Brand Management** - Create and manage brands dynamically
- 📚 **Journal Management** - CRUD operations for academic journals with brand categorization
- 📧 **Contact Management** - View, filter, and manage email contacts with global email uniqueness
- 📤 **CSV Import** - Bulk import contacts from CSV files with brand and journal selection
- 📥 **CSV Export** - Export filtered contacts to CSV files
- 🎨 **Modern UI** - Clean, responsive design with customizable theming
- 🔒 **Data Integrity** - Database-level unique constraints prevent duplicate emails globally

## Data Hierarchy

The system follows a three-tier hierarchy:

```
Brands (Dynamic)
  └── Journals (Multiple journals per brand)
      └── Contacts (Multiple contacts per journal)
```

**Key Features:**
- **Dynamic Brands**: Brands can be added, edited, or removed through the UI
- **Global Email Uniqueness**: Each email address can only exist once in the entire system
- **Brand Organization**: Journals are organized under brands for better categorization
- **Flexible Structure**: Easily add new brands without code changes

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router) + Tailwind CSS |
| Backend | Next.js API Routes / Server Actions |
| Database | PostgreSQL (Neon / Supabase) |
| ORM | Prisma |
| CSV Handling | PapaParse |
| Charts | Recharts |
| Hosting | Vercel (Free Tier) |

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm
- PostgreSQL database (local or cloud provider like Neon/Supabase)

### Local Development Setup (macOS)

#### 1. Install PostgreSQL

**Option A: Using Homebrew (Recommended)**
```bash
# Install Homebrew if you don't have it
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"

# Install PostgreSQL
brew install postgresql@16

# Start PostgreSQL service (will auto-start on login)
brew services start postgresql@16

# Create database
/opt/homebrew/opt/postgresql@16/bin/createdb email_data_management
```

**Option B: Using Postgres.app (GUI Alternative)**
1. Download from [postgresapp.com](https://postgresapp.com/)
2. Drag to Applications folder and run
3. PostgreSQL will start automatically

#### 2. Clone and Install

```bash
# Clone the repository
git clone <repository-url>
cd email-data-management

# Install dependencies
pnpm install
```

#### 3. Configure Environment

```bash
# Copy example environment file
cp .env.example .env
```

Edit `.env` with your local database connection:
```env
# For local PostgreSQL (macOS)
DATABASE_URL="postgresql://YOUR_USERNAME@localhost:5432/email_data_management"

# Example (replace 'kiki' with your macOS username):
# DATABASE_URL="postgresql://kiki@localhost:5432/email_data_management"
```

💡 **Tip**: Your macOS username is typically used for local PostgreSQL authentication. No password needed for local development.

#### 4. Setup Database Schema

**Option A: Using Multi-Database Setup (Recommended for Neon)**

If you're using Neon or want to support multiple database configurations:

1. Create your Neon database at [neon.tech](https://neon.tech)
2. Copy the `neon-setup.sql` file contents
3. Run it in Neon's SQL Editor
4. Configure the database URL in the app's Settings page
5. No `.env` file needed - each user configures their own database!

**Option B: Using Prisma Migrations (Traditional)**

```bash
# Push Prisma schema to create all tables
pnpm db:push
```

📖 **[See Multi-Database Configuration Guide for more details →](./MULTI_DATABASE_GUIDE.md)**

#### 5. Start Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

### View Database in Browser

Prisma Studio provides a visual database browser to view and edit your data:

```bash
# Open Prisma Studio
pnpm db:studio
```

This will automatically open [http://localhost:5555](http://localhost:5555) in your browser where you can:
- 🔍 Browse all tables (Journals, Email Contacts)
- ➕ Create new records
- ✏️ Edit existing records
- 🗑️ Delete records
- 🔎 Filter and search data
- 📊 View relationships between tables

**Useful Database Commands:**

```bash
# Check PostgreSQL service status
brew services info postgresql@16

# Restart PostgreSQL
brew services restart postgresql@16

# Stop PostgreSQL
brew services stop postgresql@16

# Access PostgreSQL CLI
psql email_data_management
```

### Cloud Database Setup (Alternative)

If you prefer using a cloud database instead of local PostgreSQL:

**Neon (Recommended)**
1. Create account at [Neon](https://neon.tech)
2. Create new project
3. Copy connection string
4. Update `.env`:
```env
DATABASE_URL="postgresql://username:password@host.neon.tech:5432/database?sslmode=require"
```

**Supabase**
1. Create account at [Supabase](https://supabase.com)
2. Create new project
3. Go to Settings → Database
4. Copy connection string (use "Transaction" mode)
5. Update `.env` with the connection string

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── api/               # API routes
│   │   ├── analytics/     # Dashboard analytics
│   │   ├── brands/        # Brand CRUD
│   │   ├── contacts/      # Contact CRUD
│   │   ├── export/        # CSV export
│   │   ├── import/        # CSV import
│   │   └── journals/      # Journal CRUD
│   ├── brands/            # Brands page
│   ├── contacts/          # Contacts page
│   ├── export/            # Export page
│   ├── import/            # Import page
│   ├── journals/          # Journals page
│   ├── layout.tsx         # Root layout
│   └── page.tsx           # Dashboard page
├── components/
│   ├── dashboard/         # Dashboard-specific components
│   ├── layout/            # Layout components (Sidebar, Header)
│   └── ui/                # Reusable UI components
│       ├── Badge/
│       ├── Button/
│       ├── Card/
│       ├── Input/
│       ├── Modal/
│       ├── Select/
│       ├── Spinner/
│       └── Toast/
├── lib/
│   ├── prisma.ts          # Prisma client singleton
│   └── utils.ts           # Utility functions
└── styles/
    ├── globals.css        # Global styles
    └── theme.css          # Theme variables
```

## Database Schema

### Brands Table
- `id` - Primary Key (UUID)
- `name` - Brand name (unique)
- `code` - Brand code (unique, e.g., "GMX", "CM")
- `status` - ACTIVE / INACTIVE
- `createdAt` - Created timestamp
- `updatedAt` - Updated timestamp

### Journals Table
- `id` - Primary Key (UUID)
- `name` - Journal name
- `issn` - ISSN number
- `brandId` - Foreign Key → Brands
- `subject` - Subject area
- `frequency` - Publication frequency
- `status` - ACTIVE / INACTIVE
- `createdAt` - Created timestamp

### Email Contacts Table
- `id` - Primary Key (UUID)
- `name` - Contact name
- `email` - Email address (globally unique)
- `phone` - Phone number
- `articleTitle` - Article or publication title
- `journalId` - Foreign Key → Journals
- `createdAt` - Created timestamp

**Unique Constraints:**
- `email` - Each email can only exist once in the entire system (globally unique)
- `(brands.name)` - Brand names must be unique
- `(brands.code)` - Brand codes must be unique

**Relationships:**
- One Brand → Many Journals
- One Journal → Many Email Contacts
- Each Email Contact belongs to one Journal (which belongs to one Brand)

## CSV Import Process

The CSV import follows a structured workflow to ensure data is organized correctly:

### Import Steps

1. **Select Brand** - Choose the brand this data belongs to
2. **Select Journal** - Choose a journal under the selected brand
3. **Upload CSV** - Upload your CSV file with contact data

### CSV Format

**Required columns:**
- `name` - Contact name
- `email` - Email address (must be unique across entire system)

**Optional columns:**
- `phone` - Phone number
- `article_title` - Article or publication title

**Example CSV:**
```csv
name,email,phone,article_title
John Doe,john@example.com,+1234567890,Machine Learning in Healthcare
Jane Smith,jane@example.com,,Data Science Best Practices
Bob Wilson,bob@example.com,+9876543210,AI Applications
```

### Important Notes

- **Global Email Uniqueness**: Each email address can only exist once in the database. If an email already exists (even under a different journal), it will be marked as a duplicate and skipped.
- **No Auto-Detection**: Unlike previous versions, the import process requires explicit brand and journal selection before uploading.
- **Article Title Field**: The field is now named `article_title` (previously `publication_title`)
- **Validation**: All emails are validated for correct format before import

### Duplicate Handling

When importing, the system checks for existing emails:
- ✅ **New emails**: Added to the selected journal
- ⚠️ **Duplicate emails**: Skipped and reported in the import summary
- 📊 **Import Summary**: Shows counts of successful imports, duplicates, and any errors

## API Endpoints

### Analytics
- `GET /api/analytics` - Dashboard statistics and charts data

### Brands
- `GET /api/brands` - List brands (with pagination and filters)
- `POST /api/brands` - Create brand
- `GET /api/brands/[id]` - Get brand by ID
- `PUT /api/brands/[id]` - Update brand
- `DELETE /api/brands/[id]` - Delete brand (only if no journals exist)

### Journals
- `GET /api/journals` - List journals (with pagination and filters)
- `POST /api/journals` - Create journal
- `GET /api/journals/[id]` - Get journal by ID
- `PUT /api/journals/[id]` - Update journal
- `DELETE /api/journals/[id]` - Delete journal

### Contacts
- `GET /api/contacts` - List contacts (with pagination and filters)
- `POST /api/contacts` - Create contact
- `GET /api/contacts/[id]` - Get contact by ID
- `PUT /api/contacts/[id]` - Update contact
- `DELETE /api/contacts/[id]` - Delete contact

### Import/Export
- `POST /api/import` - Import contacts from CSV (requires brandId and journalId)
- `GET /api/export` - Export contacts to CSV

## Theming

Theme colors are defined in `src/styles/theme.css`. To change the theme:

1. Open `src/styles/theme.css`
2. Modify the CSS variables under `:root`
3. Changes will apply throughout the application

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start development server |
| `pnpm build` | Build for production |
| `pnpm start` | Start production server |
| `pnpm lint` | Run ESLint |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema to database |
| `pnpm db:migrate` | Run database migrations |
| `pnpm db:studio` | Open Prisma Studio |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add `DATABASE_URL` environment variable
4. Deploy

The application is optimized for Vercel's free tier.

### Database Setup (Neon)

1. Create a free account at [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string
4. Add it to your environment variables

## Performance

- Handles up to **10 lakh (1,000,000) email records**
- Chunked CSV imports prevent timeouts
- Database indexing on frequently queried columns
- Streaming exports for large datasets
- Dashboard loads in under 2 seconds

## Contributing

1. Follow the Airbnb JavaScript Style Guide
2. Use functional components with React hooks
3. Document all components and APIs
4. Use pnpm for package management
5. Maintain styles in separate CSS module files
6. Never use inline styles

## License

MIT
