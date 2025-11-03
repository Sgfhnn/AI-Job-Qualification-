const { createClient } = require('@supabase/supabase-js')

// Use environment variables with fallback for production
const supabaseUrl = process.env.SUPABASE_URL || 'https://wuualhtukpgecdzrnlwq.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind1dWFsaHR1a3BnZWNkenJubHdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzYwNzEzMzIsImV4cCI6MjA1MTY0NzMzMn0.kOzFKQmOTdWxfKdJMOYCJLLJCJSdKzJzJzJzJzJzJzJ'

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing Supabase environment variables:')
  console.error('SUPABASE_URL:', supabaseUrl ? 'Found' : 'Missing')
  console.error('SUPABASE_SERVICE_KEY:', supabaseServiceKey ? 'Found' : 'Missing')
  throw new Error('Missing Supabase environment variables')
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

module.exports = supabase
