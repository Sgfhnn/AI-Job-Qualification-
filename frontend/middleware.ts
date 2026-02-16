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
  const publicRoutes = ['/auth', '/about', '/contact', '/features', '/demo', '/privacy', '/terms']
  const isPublicRoute = publicRoutes.some(route =>
    req.nextUrl.pathname === route || req.nextUrl.pathname.startsWith(`${route}/`)
  )

  // Protected routes that require authentication
  const protectedRoutes = ['/employer', '/candidate', '/jobs', '/apply', '/interview']
  const isProtectedRoute = protectedRoutes.some(route =>
    req.nextUrl.pathname.startsWith(route)
  )

  // Allow access to the home page
  if (req.nextUrl.pathname === '/') {
    return res
  }

  // If accessing protected route without session, redirect to signin
  if (isProtectedRoute && !session) {
    const redirectUrl = new URL('/auth/signin', req.url)
    redirectUrl.searchParams.set('redirectedFrom', req.nextUrl.pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // If accessing auth pages while logged in, redirect to the appropriate portal
  // EXCEPTION: Allow access to /auth/callback and /auth/reset-password for auth flows
  const isAuthAction = req.nextUrl.pathname === '/auth/callback' || req.nextUrl.pathname === '/auth/reset-password'
  if (session && req.nextUrl.pathname.startsWith('/auth') && !isAuthAction) {
    return NextResponse.redirect(new URL('/employer', req.url))
  }

  return res
}

export const config = {
  matcher: [
    '/employer',
    '/employer/:path*',
    '/candidate',
    '/candidate/:path*',
    '/jobs',
    '/jobs/:path*',
    '/apply/:path*',
    '/interview/:path*',
    '/auth/:path*',
  ]
}
