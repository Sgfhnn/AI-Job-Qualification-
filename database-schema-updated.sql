-- AI Job Qualification Platform Database Schema (No Authentication)
-- Run this in your Supabase SQL Editor

-- Drop existing tables if they exist to recreate with correct schema
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;

-- Create jobs table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    requirements TEXT NOT NULL,
    form_fields JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create applications table
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    job_id UUID REFERENCES jobs(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    form_data JSONB NOT NULL,
    resume_url TEXT,
    score INTEGER NOT NULL DEFAULT 0,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_applications_job_id ON applications(job_id);
CREATE INDEX IF NOT EXISTS idx_applications_score ON applications(score DESC);
CREATE INDEX IF NOT EXISTS idx_applications_created_at ON applications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);

-- Disable Row Level Security (RLS) since we're not using authentication
ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
ALTER TABLE applications DISABLE ROW LEVEL SECURITY;

-- Create storage bucket for resumes if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Make the resumes bucket fully public
UPDATE storage.buckets SET public = true WHERE id = 'resumes';

-- Drop any existing policies
DROP POLICY IF EXISTS "Allow all operations on resumes" ON storage.objects;

-- Create public access policy for resumes
CREATE POLICY "Allow public access to resumes" ON storage.objects
FOR ALL USING (bucket_id = 'resumes');

-- Grant necessary permissions
GRANT ALL ON jobs TO postgres, anon, authenticated, service_role;
GRANT ALL ON applications TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, anon, authenticated, service_role;
