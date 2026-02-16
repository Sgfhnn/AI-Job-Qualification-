import { createClient as createSupabaseClient } from '@supabase/supabase-js'

// Use environment variable if available, otherwise fall back to production URL
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://ai-job-qualifer.vercel.app'

// Supabase configuration with fallback values for build time
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Client-side Supabase client
export const createClient = () => {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.warn('Supabase environment variables not configured')
    return null
  }
  return createSupabaseClient(supabaseUrl, supabaseAnonKey)
}

// Helper function to get the correct redirect URL based on environment
export const getRedirectUrl = (path: string) => {
  // Ensure the path starts with a slash
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${SITE_URL}${normalizedPath}`
}
