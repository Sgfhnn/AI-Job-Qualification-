import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    const requestUrl = new URL(request.url)
    const code = requestUrl.searchParams.get('code')
    const next = requestUrl.searchParams.get('next')

    console.log('[Auth Callback] Hit. Code present:', !!code, 'Next:', next)

    if (code) {
        const cookieStore = cookies()
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore })
        console.log('[Auth Callback] Exchanging code for session...')
        await supabase.auth.exchangeCodeForSession(code)
        console.log('[Auth Callback] Session exchange complete')
    }

    const redirectPath = next || '/employer'
    console.log('[Auth Callback] Redirecting to:', redirectPath)

    // URL to redirect to after sign in process completes
    return NextResponse.redirect(new URL(redirectPath, request.url))
}
