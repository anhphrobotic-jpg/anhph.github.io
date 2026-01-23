-- =====================================================
-- Supabase Database Setup for Research Workspace
-- =====================================================
-- Run this in Supabase SQL Editor (Dashboard → SQL Editor)
--
-- This creates the initial notes table as a proof of concept.
-- More tables will be added as we migrate features.
-- =====================================================

-- 1. Create notes table
-- This is a simple demo table to test the integration
CREATE TABLE IF NOT EXISTS notes (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  content TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Enable Row Level Security (RLS)
-- This ensures security policies are enforced
ALTER TABLE notes ENABLE ROW LEVEL SECURITY;

-- 3. Create policy for public SELECT access
-- Temporary: Allows anyone to read notes (for testing)
-- TODO: Update this when authentication is implemented
CREATE POLICY IF NOT EXISTS "Allow public read access"
ON notes FOR SELECT
TO anon
USING (true);

-- 4. Create policy for public INSERT access
-- Temporary: Allows anyone to create notes (for testing)
-- TODO: Update this when authentication is implemented
CREATE POLICY IF NOT EXISTS "Allow public insert access"
ON notes FOR INSERT
TO anon
WITH CHECK (true);

-- 5. Create policy for public UPDATE access
-- Temporary: Allows anyone to update notes (for testing)
-- TODO: Update this when authentication is implemented
CREATE POLICY IF NOT EXISTS "Allow public update access"
ON notes FOR UPDATE
TO anon
USING (true);

-- 6. Create policy for public DELETE access
-- Temporary: Allows anyone to delete notes (for testing)
-- TODO: Update this when authentication is implemented
CREATE POLICY IF NOT EXISTS "Allow public delete access"
ON notes FOR DELETE
TO anon
USING (true);

-- 7. Create function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 8. Create trigger to call the function
CREATE TRIGGER update_notes_updated_at
BEFORE UPDATE ON notes
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- 9. Insert sample data for testing
INSERT INTO notes (title, content) VALUES
  ('Welcome to Research Workspace', 'This is your first note! The migration to Next.js + Supabase is complete.'),
  ('Next.js Migration Complete', 'Successfully migrated from static HTML to Next.js App Router with server-side rendering.'),
  ('Supabase Integration Working', 'Database connection established. Row Level Security is configured. Ready for development!'),
  ('TODO: Add Authentication', 'Next step is to implement Supabase Auth for user accounts and secure data access.'),
  ('TODO: Migrate Projects Feature', 'Create projects table and migrate the project management functionality from the legacy app.')
ON CONFLICT DO NOTHING;

-- =====================================================
-- FUTURE TABLES (Coming Soon)
-- =====================================================
-- These will be added as we progressively migrate features:
--
-- - projects: Research projects
-- - tasks: Task management
-- - papers: Research papers
-- - whiteboards: Collaborative whiteboards
-- - users: User profiles (if not using Supabase Auth)
-- =====================================================

-- =====================================================
-- VERIFICATION QUERIES
-- =====================================================
-- Run these to verify the setup:

-- Check table exists and has data
SELECT COUNT(*) as total_notes FROM notes;

-- View all notes
SELECT * FROM notes ORDER BY created_at DESC;

-- Check RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'notes';

-- List all policies
SELECT * FROM pg_policies WHERE tablename = 'notes';

-- =====================================================
-- SUCCESS CRITERIA
-- =====================================================
-- ✅ Table 'notes' exists
-- ✅ RLS is enabled (rowsecurity = true)
-- ✅ 4 policies created (SELECT, INSERT, UPDATE, DELETE)
-- ✅ Sample data inserted (5 notes)
-- ✅ Trigger created for updated_at
-- =====================================================

-- Done! Your database is ready for Next.js integration.
-- Next: Configure .env.local with your Supabase credentials.
