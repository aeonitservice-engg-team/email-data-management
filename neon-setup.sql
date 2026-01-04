-- ================================================================
-- Email Data Management Database Setup for Neon
-- ================================================================
-- 
-- This script sets up a complete database schema for the Email Data
-- Management system. Run this script in your Neon SQL Editor to create
-- all necessary tables, indexes, and constraints.
--
-- Instructions:
-- 1. Create a new Neon project at https://neon.tech
-- 2. Copy your database connection string
-- 3. Open the SQL Editor in your Neon dashboard
-- 4. Paste and run this entire script
-- 5. Configure the database URL in your app settings
--
-- ================================================================

-- Create Status enum (used by both brands and journals)
DO $$ BEGIN
  CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE');
EXCEPTION
  WHEN duplicate_object THEN 
    RAISE NOTICE 'Type "Status" already exists, skipping...';
END $$;

-- ================================================================
-- TABLE: brands
-- ================================================================
-- Stores brand/publisher information
CREATE TABLE IF NOT EXISTS "brands" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- ================================================================
-- TABLE: journals
-- ================================================================
-- Stores academic journal metadata
CREATE TABLE IF NOT EXISTS "journals" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "issn" TEXT,
    "subject" TEXT,
    "frequency" TEXT,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "brand_id" TEXT NOT NULL,

    CONSTRAINT "journals_pkey" PRIMARY KEY ("id")
);

-- ================================================================
-- TABLE: email_contacts
-- ================================================================
-- Stores email contact information from authors/contributors
CREATE TABLE IF NOT EXISTS "email_contacts" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "article_title" TEXT,
    "year" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "journal_id" TEXT NOT NULL,

    CONSTRAINT "email_contacts_pkey" PRIMARY KEY ("id")
);

-- ================================================================
-- UNIQUE CONSTRAINTS
-- ================================================================

-- Brands must have unique names and codes
CREATE UNIQUE INDEX IF NOT EXISTS "brands_name_key" ON "brands"("name");
CREATE UNIQUE INDEX IF NOT EXISTS "brands_code_key" ON "brands"("code");

-- Email must be unique per journal (same email can exist in different journals)
CREATE UNIQUE INDEX IF NOT EXISTS "email_contacts_email_journal_id_key" 
    ON "email_contacts"("email", "journal_id");

-- ================================================================
-- PERFORMANCE INDEXES - Brands
-- ================================================================

-- Index for filtering by status
CREATE INDEX IF NOT EXISTS "brands_status_idx" 
    ON "brands"("status");

-- Index for sorting by creation date
CREATE INDEX IF NOT EXISTS "brands_created_at_idx" 
    ON "brands"("created_at");

-- ================================================================
-- PERFORMANCE INDEXES - Journals
-- ================================================================

-- Index for foreign key lookups
CREATE INDEX IF NOT EXISTS "journals_brand_id_idx" 
    ON "journals"("brand_id");

-- Index for status filtering
CREATE INDEX IF NOT EXISTS "journals_status_idx" 
    ON "journals"("status");

-- Index for date sorting
CREATE INDEX IF NOT EXISTS "journals_created_at_idx" 
    ON "journals"("created_at");

-- Composite index for brand queries with status filter
CREATE INDEX IF NOT EXISTS "journals_brand_id_status_idx" 
    ON "journals"("brand_id", "status");

-- Composite index for filtered sorting
CREATE INDEX IF NOT EXISTS "journals_status_name_idx" 
    ON "journals"("status", "name");

-- ================================================================
-- PERFORMANCE INDEXES - Email Contacts
-- ================================================================

-- Index for foreign key lookups
CREATE INDEX IF NOT EXISTS "email_contacts_journal_id_idx" 
    ON "email_contacts"("journal_id");

-- Index for date filtering and sorting
CREATE INDEX IF NOT EXISTS "email_contacts_created_at_idx" 
    ON "email_contacts"("created_at");

-- Index for email searches
CREATE INDEX IF NOT EXISTS "email_contacts_email_idx" 
    ON "email_contacts"("email");

-- Index for year filtering
CREATE INDEX IF NOT EXISTS "email_contacts_year_idx" 
    ON "email_contacts"("year");

-- Composite index for journal contact queries with date sorting
CREATE INDEX IF NOT EXISTS "email_contacts_journal_id_created_at_idx" 
    ON "email_contacts"("journal_id", "created_at");

-- Composite index for groupBy operations on createdAt
CREATE INDEX IF NOT EXISTS "email_contacts_created_at_id_idx" 
    ON "email_contacts"("created_at", "id");

-- ================================================================
-- FOREIGN KEY CONSTRAINTS
-- ================================================================

-- Journals belong to brands (cascade delete - deleting brand deletes journals)
DO $$ BEGIN
    ALTER TABLE "journals" ADD CONSTRAINT "journals_brand_id_fkey" 
        FOREIGN KEY ("brand_id") REFERENCES "brands"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'Foreign key "journals_brand_id_fkey" already exists, skipping...';
END $$;

-- Email contacts belong to journals (cascade delete - deleting journal deletes contacts)
DO $$ BEGIN
    ALTER TABLE "email_contacts" ADD CONSTRAINT "email_contacts_journal_id_fkey" 
        FOREIGN KEY ("journal_id") REFERENCES "journals"("id") 
        ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
    WHEN duplicate_object THEN 
        RAISE NOTICE 'Foreign key "email_contacts_journal_id_fkey" already exists, skipping...';
END $$;

-- ================================================================
-- VERIFICATION QUERIES
-- ================================================================
-- Run these to verify the setup completed successfully

-- Check that all tables were created
SELECT 
    table_name,
    (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
    AND table_type = 'BASE TABLE'
    AND table_name IN ('brands', 'journals', 'email_contacts')
ORDER BY table_name;

-- Check that all indexes were created
SELECT 
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
    AND tablename IN ('brands', 'journals', 'email_contacts')
ORDER BY tablename, indexname;

-- ================================================================
-- SETUP COMPLETE!
-- ================================================================
-- 
-- Your database is now ready to use. Next steps:
-- 1. Copy your Neon database connection string
-- 2. Go to Settings in your app
-- 3. Paste the connection string and test it
-- 4. Save and start using your personalized database!
--
-- The connection string format should be:
-- postgresql://username:password@host.neon.tech:5432/dbname?sslmode=require
--
-- ================================================================
