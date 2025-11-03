-- Database Reset Script - Run this in Supabase SQL Editor
-- This will fix the schema mismatch issue

-- Drop existing tables and recreate with correct schema
DROP TABLE IF EXISTS applications CASCADE;
DROP TABLE IF EXISTS jobs CASCADE;

-- Create jobs table with correct schema
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
CREATE INDEX idx_applications_job_id ON applications(job_id);
CREATE INDEX idx_applications_score ON applications(score DESC);
CREATE INDEX idx_applications_created_at ON applications(created_at DESC);
CREATE INDEX idx_jobs_created_at ON jobs(created_at DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

-- Create policies for public access (since we're not implementing auth)
CREATE POLICY "Allow all operations on jobs" ON jobs FOR ALL USING (true);
CREATE POLICY "Allow all operations on applications" ON applications FOR ALL USING (true);

-- Create storage bucket for resumes if it doesn't exist
INSERT INTO storage.buckets (id, name, public) 
VALUES ('resumes', 'resumes', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policy for resumes
DROP POLICY IF EXISTS "Allow all operations on resumes" ON storage.objects;
CREATE POLICY "Allow all operations on resumes" ON storage.objects FOR ALL USING (bucket_id = 'resumes');
