const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('⚠️ Missing Supabase environment variables.')
  console.error('  SUPABASE_URL:', supabaseUrl ? '✅' : '❌ Missing')
  console.error('  SUPABASE_ANON_KEY:', supabaseKey ? '✅' : '❌ Missing')
  throw new Error('Missing required Supabase environment variables. Set SUPABASE_URL and SUPABASE_ANON_KEY.')
}

const supabase = createClient(supabaseUrl, supabaseKey)

module.exports = supabase
