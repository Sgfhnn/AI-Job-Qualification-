'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-job-qualification.onrender.com'

interface Job {
  id: string
  title: string
  requirements: string
  created_at: string
}

export default function EmployerDashboard() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()

        if (!session) {
          console.log('[Dashboard] No session found, redirecting to signin');
          router.push('/auth/signin')
          return
        }

        console.log(`[Dashboard] Fetching jobs for employerId: ${session.user.id}`);
        const response = await fetch(`${API_BASE_URL}/api/jobs?employerId=${session.user.id}`)

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json()
        console.log(`[Dashboard] Received ${data.jobs?.length || 0} jobs from API`);

        if (data.success) {
          setJobs(data.jobs)
        } else {
          setError(data.error || 'Failed to fetch jobs')
        }
      } catch (err: any) {
        console.error('[Dashboard] Fetch error:', err);
        setError(`Connection error: ${err.message}. Please ensure the backend is running.`);
      } finally {
        setLoading(false)
      }
    }
    fetchJobs()
  }, [supabase, router])

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-12">
          <div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">Employer Dashboard</h1>
            <p className="text-slate-500 mt-2 font-medium">Manage your active job postings and track applicants.</p>
          </div>
          <Link
            href="/employer/create"
            className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-3 rounded-xl font-black text-lg shadow-xl shadow-indigo-200 transition-all hover:-translate-y-0.5"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" />
            </svg>
            Add New Job
          </Link>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 grayscale opacity-50">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-900 border-t-transparent mb-4"></div>
            <p className="font-bold text-slate-900 italic">Syncing with recruiters database...</p>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-100 p-6 rounded-2xl text-center">
            <p className="text-red-700 font-bold mb-4">{error}</p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-red-600 text-white rounded-lg font-bold"
            >
              Retry
            </button>
          </div>
        ) : jobs.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-16 text-center">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mb-2">No jobs posted yet</h2>
            <p className="text-slate-500 mb-8 max-w-sm mx-auto">Start your hiring process by creating your first AI-optimized job application form.</p>
            <Link
              href="/employer/create"
              className="bg-slate-900 text-white px-8 py-3 rounded-xl font-black transition-all hover:bg-slate-800"
            >
              Post First Job
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {jobs.map((job) => (
              <div
                key={job.id}
                className="group bg-white rounded-3xl border border-slate-200 p-6 shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-indigo-50 rounded-2xl text-indigo-600 group-hover:bg-indigo-600 group-hover:text-white transition-colors">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <span className="text-[10px] uppercase tracking-widest font-black text-slate-400">
                    {new Date(job.created_at).toLocaleDateString()}
                  </span>
                </div>

                <h3 className="text-xl font-black text-slate-900 mb-2 line-clamp-1 group-hover:text-indigo-600 transition-colors">
                  {job.title}
                </h3>

                <p className="text-slate-500 text-sm mb-6 line-clamp-2 h-10 font-medium">
                  {job.requirements}
                </p>

                <div className="grid grid-cols-2 gap-3 pt-2">
                  <Link
                    href={`/employer/dashboard/${job.id}`}
                    className="flex items-center justify-center px-4 py-2.5 bg-slate-100 hover:bg-indigo-600 hover:text-white text-slate-700 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                  >
                    Results
                  </Link>
                  <Link
                    href={`/apply/${job.id}`}
                    target="_blank"
                    className="flex items-center justify-center px-4 py-2.5 bg-indigo-50 text-indigo-600 hover:bg-indigo-100 rounded-xl text-xs font-black uppercase tracking-wider transition-all"
                  >
                    Public Link
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
