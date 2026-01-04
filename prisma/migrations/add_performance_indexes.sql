-- Add composite indexes for better query performance

-- Index for groupBy operations on createdAt
CREATE INDEX IF NOT EXISTS idx_email_contacts_created_at_id ON email_contacts(created_at, id);

-- Composite index for brand and journal queries with counts
CREATE INDEX IF NOT EXISTS idx_journals_brand_status ON journals(brand_id, status);

-- Index for filtering and sorting journals efficiently
CREATE INDEX IF NOT EXISTS idx_journals_status_name ON journals(status, name);

-- Index for efficient counting of contacts per journal
CREATE INDEX IF NOT EXISTS idx_email_contacts_journal_created ON email_contacts(journal_id, created_at);
