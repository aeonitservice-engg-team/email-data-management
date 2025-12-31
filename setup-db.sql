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

-- Insert default brands (GlobalMeetX and ConfMeets)
INSERT INTO "brands" ("id", "name", "code", "status", "created_at", "updated_at")
VALUES 
  ('clx0000001', 'GlobalMeetX', 'GMX', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('clx0000002', 'ConfMeets', 'CM', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT ("name") DO NOTHING;
CREATE INDEX IF NOT EXISTS "email_contacts_email_idx" ON "email_contacts"("email");

-- Create unique constraint for email_contacts
CREATE UNIQUE INDEX IF NOT EXISTS "email_contacts_email_journal_id_key" ON "email_contacts"("email", "journal_id");

-- Insert sample data (optional)
-- Uncomment the lines below to add sample data

-- INSERT INTO "journals" ("id", "name", "brand", "status", "created_at", "updated_at")
-- VALUES 
--   ('sample1', 'Sample Journal 1', 'GLOBALMEETX', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
--   ('sample2', 'Sample Journal 2', 'CONFMEETS', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);

COMMIT;
