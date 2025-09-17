import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const res = NextResponse.next()
  
  // Check if required environment variables are present
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
    console.error('Missing Supabase environment variables')
    return res
  }
  
  const supabase = createMiddlewareClient({ req, res })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Public routes that don't require authentication
  const publicRoutes = ['/apply', '/auth']
  const isPublicRoute = publicRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )
  
  // Protected routes that require authentication
  const protectedRoutes = ['/employer/dashboard']
  const isProtectedRoute = protectedRoutes.some(route => 
    req.nextUrl.pathname.startsWith(route)
  )
  
  // Skip auth checks for public routes
  if (isPublicRoute) {
    return res
  }

  // If accessing protected route without session, redirect to signin
  if (isProtectedRoute && !session) {
    return NextResponse.redirect(new URL('/auth/signin', req.url))
  }

  // If accessing auth pages while logged in, redirect to employer page
  if (session && (req.nextUrl.pathname.startsWith('/auth/signin') || req.nextUrl.pathname.startsWith('/auth/signup'))) {
    return NextResponse.redirect(new URL('/employer', req.url))
  }

  return res
}

export const config = {
  matcher: ['/employer/dashboard/:path*', '/auth/:path*', '/apply/:path*']
}
