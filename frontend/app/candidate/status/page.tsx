'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { useRouter } from 'next/navigation'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-job-qualification.onrender.com'

export default function CandidateStatusPage() {
    const [email, setEmail] = useState('')
    const [applications, setApplications] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')
    const router = useRouter()
    const supabase = createClientComponentClient()

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/auth/signin?redirectedFrom=/candidate/status')
            }
        }
        checkAuth()
    }, [supabase, router])

    const checkStatus = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setApplications([])

        try {
            const response = await fetch(`${API_BASE_URL}/api/candidate/status`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            const data = await response.json();

            if (data.success && data.applications) {
                setApplications(data.applications);
            } else {
                setError(data.message || 'No applications found for this email');
            }
        } catch (e) {
            setError('Error connecting to server');
        } finally {
            setLoading(false);
        }
    }

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'AI_INTERVIEW': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'REJECTED': return 'bg-red-100 text-red-800 border-red-200';
            case 'HIRED': return 'bg-green-100 text-green-800 border-green-200';
            case 'DIRECT_CONTACT': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'INTERVIEW_COMPLETED': return 'bg-teal-100 text-teal-800 border-teal-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    }

    const getStatusMessage = (status: string) => {
        switch (status) {
            case 'PENDING': return 'Your application is under review.';
            case 'AI_INTERVIEW': return "You've been invited to a Phase 2 AI interview!";
            case 'REJECTED': return 'Thank you for your interest. We are moving forward with other candidates.';
            case 'HIRED': return 'Congratulations! You have been hired.';
            case 'DIRECT_CONTACT': return 'The employer will contact you directly for an interview.';
            case 'INTERVIEW_COMPLETED': return 'AI Interview completed. Results are being reviewed.';
            default: return 'Application received.';
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-12">
                    <h2 className="text-4xl font-extrabold text-gray-900 tracking-tight">
                        Candidate Dashboard
                    </h2>
                    <p className="mt-3 text-lg text-gray-600">
                        Track your application progress and manage interviews
                    </p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow-xl border border-slate-200 mb-8">
                    <form className="space-y-4" onSubmit={checkStatus}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                Registered Email Address
                            </label>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <input
                                    id="email"
                                    type="email"
                                    required
                                    className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    placeholder="Enter the email you used to apply"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg transition-all disabled:opacity-50 active:scale-95"
                                >
                                    {loading ? 'Searching...' : 'Check Status'}
                                </button>
                            </div>
                        </div>
                    </form>

                    {error && (
                        <div className="mt-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-xl text-center font-medium animate-in fade-in slide-in-from-top-2">
                            {error}
                        </div>
                    )}
                </div>

                {applications.length > 0 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <div className="flex items-center justify-between px-2">
                            <h3 className="text-xl font-bold text-gray-800">Your Applications ({applications.length})</h3>
                        </div>

                        <div className="grid gap-6">
                            {applications.map((app) => (
                                <div key={app.id} className="bg-white rounded-2xl shadow-md border border-slate-100 overflow-hidden hover:shadow-lg transition-shadow">
                                    <div className="p-6">
                                        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                            <div>
                                                <h4 className="text-xl font-bold text-gray-900">{app.jobTitle}</h4>
                                                <p className="text-sm text-gray-500 mt-1">
                                                    Applied on {new Date(app.submittedAt).toLocaleDateString()}
                                                </p>
                                            </div>
                                            <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border ${getStatusColor(app.status)}`}>
                                                {app.status?.replace('_', ' ') || 'PENDING'}
                                            </div>
                                        </div>

                                        <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                            <p className="text-gray-700 font-medium">{getStatusMessage(app.status)}</p>
                                        </div>

                                        {app.status === 'AI_INTERVIEW' && (
                                            <div className="mt-6 flex flex-col sm:flex-row items-center gap-4">
                                                <Link
                                                    href={`/interview/${app.id}`}
                                                    className="w-full sm:w-auto px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-indigo-200 shadow-lg transition-all text-center active:scale-95"
                                                >
                                                    Start AI Interview
                                                </Link>
                                                <p className="text-xs text-gray-400 italic">
                                                    Voice-based interview • Approx. 5 mins • Requires microphone
                                                </p>
                                            </div>
                                        )}

                                        {app.status === 'INTERVIEW_COMPLETED' && (
                                            <div className="mt-4 flex items-center text-teal-600 text-sm font-semibold">
                                                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                </svg>
                                                Interview assessment in progress
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
