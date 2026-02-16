'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { cn } from '@/lib/utils'

export default function Home() {
  const router = useRouter()
  const supabase = createClientComponentClient()
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.user) {
        setUser(session.user)
        // Optionally redirect automatically if they are already logged in and land on home
        // router.push('/employer') 
      }
      setLoading(false)
    }
    getUser()
  }, [supabase.auth, router])

  const handleStartHiring = (e: React.MouseEvent) => {
    if (loading) {
      e.preventDefault()
      return
    }
    if (user) {
      e.preventDefault()
      router.push('/employer')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 relative overflow-hidden">
      {/* Background Decor */}
      <div className="absolute inset-0 bg-[url('/grid.svg')] bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]" />
      <div className="absolute top-0 -left-4 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob" />
      <div className="absolute top-0 -right-4 w-72 h-72 bg-yellow-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000" />

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center rounded-full border border-purple-200 bg-purple-50 px-3 py-1 text-sm text-purple-600 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <span className="flex h-2 w-2 rounded-full bg-purple-600 mr-2 animate-pulse"></span>
            AI-Powered Recruitment V2.0
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-gray-900 mb-8 animate-in fade-in slide-in-from-bottom-8 duration-700">
            Hire Smarter with <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
              AI Voice Interviewing
            </span>
          </h1>

          <p className="mt-6 text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-12 duration-1000">
            The world's first recruitment platform with an autonomous AI Agent Voice Interviewer.
            Automate screening, rank candidates intelligently, and conduct human-like voice interviews—all in one place.
          </p>

          <div className="mt-10 flex justify-center animate-in fade-in slide-in-from-bottom-16 duration-1000">
            <Link
              href="/auth/signup"
              onClick={handleStartHiring}
              className={cn(
                "inline-flex items-center justify-center rounded-full text-base font-semibold transition-all duration-200",
                "bg-primary text-primary-foreground hover:bg-primary/90 hover:scale-105 hover:shadow-lg",
                "px-8 py-4 h-14 min-w-[200px]"
              )}
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing...
                </span>
              ) : 'Start Hiring Now'}
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                title: "AI Voice Interviewer",
                description: "Our autonomous AI agent conducts human-like voice interviews, evaluating candidate soft skills and technical knowledge automatically.",
                icon: (
                  <svg className="w-6 h-6 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                ),
                color: "bg-indigo-100"
              },
              {
                title: "Resume Intelligence",
                description: "Deep learning algorithms parse resumes to extract skills, experience, and compatibility scores instantly.",
                icon: (
                  <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                ),
                color: "bg-purple-100"
              },
              {
                title: "Automated Screening",
                description: "Save 80% of your time with automated pre-screening questions and candidate ranking driven by AI data.",
                icon: (
                  <svg className="w-6 h-6 text-pink-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ),
                color: "bg-pink-100"
              }
            ].map((feature, index) => (
              <div
                key={index}
                className="glass p-8 rounded-2xl border border-white/20 hover:scale-105 hover:shadow-xl transition-all duration-300"
              >
                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center mb-6", feature.color)}>
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 relative z-10">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="glass bg-gradient-to-r from-purple-900 to-indigo-900 p-12 rounded-3xl text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-80 h-80 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl" />

            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to find your next star employee?</h2>
              <p className="text-lg text-purple-100 mb-8 max-w-2xl mx-auto">
                Join thousands of recruiting teams who have streamlined their hiring pipeline with our AI technology.
              </p>
              <Link
                href="/auth/signup"
                onClick={handleStartHiring}
                className="inline-flex items-center justify-center bg-white text-purple-900 px-8 py-4 rounded-full font-bold text-lg hover:bg-gray-100 hover:shadow-lg transition-all transform hover:-translate-y-1"
              >
                {loading ? 'Processing...' : 'Get Started Now'}
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
