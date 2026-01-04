-- ================================================================
-- Verification & Testing Queries
-- ================================================================
-- Run these queries in your Neon SQL Editor to verify your database
-- is set up correctly and to test with sample data.
-- ================================================================

-- ================================================================
-- PART 1: VERIFY STRUCTURE
-- ================================================================

-- Check all tables exist
SELECT 
  table_name,
  (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name) as column_count
FROM information_schema.tables t
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
ORDER BY table_name;
-- Expected: 3 tables (brands, email_contacts, journals)

-- Check all indexes
SELECT 
  tablename,
  COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
-- Expected: Multiple indexes per table for performance

-- Check foreign key constraints
SELECT
  tc.table_name, 
  tc.constraint_name, 
  kcu.column_name,
  ccu.table_name AS foreign_table_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_schema = 'public';
-- Expected: 2 foreign keys (journals->brands, email_contacts->journals)

-- ================================================================
-- PART 2: INSERT SAMPLE DATA (Optional)
-- ================================================================

-- Insert sample brands
INSERT INTO brands (id, name, code, status, created_at, updated_at)
VALUES 
  ('brand_test_1', 'Test Publisher', 'TP', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('brand_test_2', 'Sample Press', 'SP', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Insert sample journals
INSERT INTO journals (id, name, issn, subject, brand_id, status, created_at, updated_at)
VALUES 
  ('journal_test_1', 'Test Journal of Science', '1234-5678', 'Science', 'brand_test_1', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('journal_test_2', 'Sample Medical Review', '8765-4321', 'Medicine', 'brand_test_2', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Insert sample contacts
INSERT INTO email_contacts (id, name, email, phone, article_title, year, journal_id, created_at, updated_at)
VALUES 
  ('contact_test_1', 'John Doe', 'john.doe@example.com', '+1-555-0100', 'Sample Article 1', 2024, 'journal_test_1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('contact_test_2', 'Jane Smith', 'jane.smith@example.com', '+1-555-0200', 'Sample Article 2', 2024, 'journal_test_1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
  ('contact_test_3', 'Bob Johnson', 'bob.johnson@example.com', NULL, 'Sample Article 3', 2024, 'journal_test_2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email, journal_id) DO NOTHING;

-- ================================================================
-- PART 3: VERIFY DATA
-- ================================================================

-- Count records
SELECT 'Brands' as table_name, COUNT(*) as record_count FROM brands
UNION ALL
SELECT 'Journals', COUNT(*) FROM journals
UNION ALL
SELECT 'Email Contacts', COUNT(*) FROM email_contacts;
-- Expected: At least 2 brands, 2 journals, 3 contacts if you ran sample data

-- Check brand-journal relationships
SELECT 
  b.name as brand_name,
  b.code as brand_code,
  COUNT(j.id) as journal_count
FROM brands b
LEFT JOIN journals j ON j.brand_id = b.id
GROUP BY b.id, b.name, b.code
ORDER BY b.name;
-- Expected: Each brand with count of associated journals

-- Check journal-contact relationships
SELECT 
  j.name as journal_name,
  b.name as brand_name,
  COUNT(ec.id) as contact_count
FROM journals j
JOIN brands b ON b.id = j.brand_id
LEFT JOIN email_contacts ec ON ec.journal_id = j.id
GROUP BY j.id, j.name, b.name
ORDER BY b.name, j.name;
-- Expected: Each journal with count of associated contacts

-- View all data with relationships
SELECT 
  ec.name as contact_name,
  ec.email,
  ec.article_title,
  j.name as journal_name,
  b.name as brand_name,
  b.code as brand_code
FROM email_contacts ec
JOIN journals j ON j.id = ec.journal_id
JOIN brands b ON b.id = j.brand_id
ORDER BY b.name, j.name, ec.name;
-- Expected: Full view of all contacts with their journal and brand info

-- ================================================================
-- PART 4: TEST CONSTRAINTS
-- ================================================================

-- This should FAIL (duplicate email in same journal)
-- Uncomment to test:
-- INSERT INTO email_contacts (id, name, email, journal_id, created_at, updated_at)
-- VALUES ('test_duplicate', 'Test Duplicate', 'john.doe@example.com', 'journal_test_1', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP);
-- Expected: ERROR - violates unique constraint "email_contacts_email_journal_id_key"

-- This should SUCCEED (same email but different journal)
INSERT INTO email_contacts (id, name, email, journal_id, created_at, updated_at)
VALUES ('contact_test_4', 'John Doe Clone', 'john.doe@example.com', 'journal_test_2', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email, journal_id) DO NOTHING;
-- Expected: Success - same email allowed in different journals

-- ================================================================
-- PART 5: TEST CASCADE DELETE
-- ================================================================

-- Create a test brand with journal and contacts
INSERT INTO brands (id, name, code, status, created_at, updated_at)
VALUES ('brand_delete_test', 'Delete Test Brand', 'DT', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO journals (id, name, brand_id, status, created_at, updated_at)
VALUES ('journal_delete_test', 'Delete Test Journal', 'brand_delete_test', 'ACTIVE', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO email_contacts (id, name, email, journal_id, created_at, updated_at)
VALUES ('contact_delete_test', 'Delete Test Contact', 'delete.test@example.com', 'journal_delete_test', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
ON CONFLICT (email, journal_id) DO NOTHING;

-- Check they exist
SELECT COUNT(*) as count FROM brands WHERE id = 'brand_delete_test';
SELECT COUNT(*) as count FROM journals WHERE id = 'journal_delete_test';
SELECT COUNT(*) as count FROM email_contacts WHERE id = 'contact_delete_test';
-- Expected: 1 for each

-- Delete the brand (should cascade delete journal and contacts)
DELETE FROM brands WHERE id = 'brand_delete_test';

-- Verify cascade deletion worked
SELECT COUNT(*) as remaining_brands FROM brands WHERE id = 'brand_delete_test';
SELECT COUNT(*) as remaining_journals FROM journals WHERE id = 'journal_delete_test';
SELECT COUNT(*) as remaining_contacts FROM email_contacts WHERE id = 'contact_delete_test';
-- Expected: 0 for all (cascade delete worked)

-- ================================================================
-- PART 6: PERFORMANCE TEST
-- ================================================================

-- Test index usage on common queries
EXPLAIN ANALYZE
SELECT * FROM email_contacts 
WHERE journal_id = 'journal_test_1' 
ORDER BY created_at DESC;
-- Expected: Should use index on journal_id and created_at

EXPLAIN ANALYZE
SELECT b.*, COUNT(j.id) as journal_count
FROM brands b
LEFT JOIN journals j ON j.brand_id = b.id
WHERE b.status = 'ACTIVE'
GROUP BY b.id;
-- Expected: Should use index on status and brand_id

-- ================================================================
-- PART 7: CLEANUP (Optional)
-- ================================================================

-- Remove sample data (if you want to start fresh)
-- DELETE FROM email_contacts WHERE id LIKE 'contact_test_%';
-- DELETE FROM journals WHERE id LIKE 'journal_test_%';
-- DELETE FROM brands WHERE id LIKE 'brand_test_%';

-- Or drop all data (WARNING: Deletes everything!)
-- TRUNCATE email_contacts, journals, brands CASCADE;

-- ================================================================
-- VERIFICATION COMPLETE!
-- ================================================================
-- 
-- If all queries ran successfully, your database is ready to use!
-- 
-- Next steps:
-- 1. Copy your Neon connection string
-- 2. Go to the app Settings page
-- 3. Configure and test your connection
-- 4. Start importing your real data!
-- 
-- ================================================================
