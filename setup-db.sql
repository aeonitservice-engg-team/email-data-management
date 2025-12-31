-- Email Data Management Database Setup
-- Run this if Prisma migrations don't work

-- Create Status enum (used by both brands and journals)
DO $$ BEGIN
  CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create brands table
CREATE TABLE IF NOT EXISTS "brands" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT UNIQUE NOT NULL,
  "code" TEXT UNIQUE NOT NULL,
  "status" "Status" NOT NULL DEFAULT 'ACTIVE',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);

-- Create journals table
CREATE TABLE IF NOT EXISTS "journals" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "issn" TEXT,
  "subject" TEXT,
  "frequency" TEXT,
  "status" "Status" NOT NULL DEFAULT 'ACTIVE',
  "brand_id" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "journals_brand_id_fkey" FOREIGN KEY ("brand_id") REFERENCES "brands"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create email_contacts table
CREATE TABLE IF NOT EXISTS "email_contacts" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "email" TEXT UNIQUE NOT NULL,
  "phone" TEXT,
  "article_title" TEXT,
  "year" INTEGER,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  "journal_id" TEXT NOT NULL,
  CONSTRAINT "email_contacts_journal_id_fkey" FOREIGN KEY ("journal_id") REFERENCES "journals"("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- Create indexes for brands
CREATE INDEX IF NOT EXISTS "brands_status_idx" ON "brands"("status");
CREATE INDEX IF NOT EXISTS "brands_created_at_idx" ON "brands"("created_at");

-- Create indexes for journals
CREATE INDEX IF NOT EXISTS "journals_brand_id_idx" ON "journals"("brand_id");
CREATE INDEX IF NOT EXISTS "journals_status_idx" ON "journals"("status");
CREATE INDEX IF NOT EXISTS "journals_created_at_idx" ON "journals"("created_at");

-- Create indexes for email_contacts
CREATE INDEX IF NOT EXISTS "email_contacts_journal_id_idx" ON "email_contacts"("journal_id");
CREATE INDEX IF NOT EXISTS "email_contacts_created_at_idx" ON "email_contacts"("created_at");
CREATE INDEX IF NOT EXISTS "email_contacts_email_idx" ON "email_contacts"("email");
CREATE INDEX IF NOT EXISTS "email_contacts_year_idx" ON "email_contacts"("year");

-- Note: Brands should be created through the application UI, not in SQL
-- This allows for dynamic brand management

COMMIT;
