'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-job-qualification.onrender.com'

// Toast Component
const Toast = ({ message, type = 'success', onClose }: { message: string, type?: 'success' | 'error', onClose: () => void }) => {
    return (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
            }`}>
            <div className="flex items-start">
                <div className="flex-1">
                    <div className="text-sm font-medium whitespace-pre-line">
                        {message}
                    </div>
                </div>
                <button
                    onClick={onClose}
                    className="ml-4 text-white hover:text-gray-200"
                >
                    ✕
                </button>
            </div>
        </div>
    )
}

export default function CreateJobPage() {
    const [jobTitle, setJobTitle] = useState('')
    const [requirements, setRequirements] = useState('')
    const [isGenerating, setIsGenerating] = useState(false)
    const [isExtracting, setIsExtracting] = useState(false)
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)
    const router = useRouter()
    const supabase = createClientComponentClient()

    useEffect(() => {
        const checkAuth = async () => {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                router.push('/auth/signin')
            }
        }
        checkAuth()
    }, [supabase, router])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsGenerating(true)

        try {
            const { data: { session } } = await supabase.auth.getSession()

            if (!session) {
                setToast({ message: 'Session expired. Please sign in again.', type: 'error' })
                router.push('/auth/signin')
                return
            }

            const response = await fetch(`${API_BASE_URL}/api/jobs/create`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    jobTitle,
                    requirements,
                    employerId: session.user.id
                }),
            })

            const data = await response.json()

            if (data.success) {
                setToast({
                    message: '✅ Job form created successfully!\nRedirecting to dashboard...',
                    type: 'success'
                })

                setTimeout(() => {
                    router.push(`/employer/dashboard/${data.jobId}`)
                }, 2000)
            } else {
                setToast({
                    message: 'Error creating job form: ' + data.error,
                    type: 'error'
                })
            }
        } catch (error) {
            console.error('Error:', error)
            setToast({
                message: 'Error creating job form. Please try again.',
                type: 'error'
            })
        } finally {
            setIsGenerating(false)
        }
    }

    const handleFileExtract = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setIsExtracting(true)
        const formData = new FormData()
        formData.append('jobFile', file)

        try {
            const response = await fetch(`${API_BASE_URL}/api/jobs/extract`, {
                method: 'POST',
                body: formData,
            })

            const data = await response.json()
            if (data.success) {
                setJobTitle(data.jobTitle)
                setRequirements(data.requirements)
                setToast({ message: '✅ Job details extracted successfully!', type: 'success' })
            } else {
                setToast({ message: 'Error extracting job details: ' + data.error, type: 'error' })
            }
        } catch (error) {
            console.error('Extraction Error:', error)
            setToast({ message: 'Failed to connect to server for extraction', type: 'error' })
        } finally {
            setIsExtracting(false)
            e.target.value = ''
        }
    }

    React.useEffect(() => {
        if (toast) {
            const timer = setTimeout(() => {
                setToast(null)
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [toast])

    return (
        <div className="min-h-screen bg-slate-50">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <div className="mb-8">
                        <Link
                            href="/employer"
                            className="text-slate-500 hover:text-slate-800 flex items-center gap-2 mb-4 transition-colors"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back to Dashboard
                        </Link>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">
                            Post a New Job
                        </h1>
                        <p className="text-slate-500 mt-2">
                            Generate a high-conversion application form with AI
                        </p>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8">
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="p-6 bg-indigo-50/50 border-2 border-dashed border-indigo-200 rounded-xl">
                                <label className="block text-sm font-bold text-indigo-900 mb-2">
                                    Populate from File (Optional)
                                </label>
                                <div className="flex items-center space-x-4">
                                    <input
                                        type="file"
                                        accept=".pdf,.doc,.docx,.txt"
                                        onChange={handleFileExtract}
                                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-bold file:bg-indigo-600 file:text-white hover:file:bg-indigo-700 cursor-pointer"
                                        disabled={isExtracting}
                                    />
                                    {isExtracting && (
                                        <div className="animate-spin h-5 w-5 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                                    )}
                                </div>
                                <p className="mt-3 text-xs text-indigo-600/70 font-medium">
                                    Upload a JD (PDF/Word) and our AI will extract the essentials.
                                </p>
                            </div>

                            <div>
                                <label htmlFor="jobTitle" className="block text-sm font-bold text-slate-700 mb-2">
                                    Job Title
                                </label>
                                <input
                                    type="text"
                                    id="jobTitle"
                                    value={jobTitle}
                                    onChange={(e) => setJobTitle(e.target.value)}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                    placeholder="e.g., Senior Full Stack Developer"
                                    required
                                />
                            </div>

                            <div>
                                <label htmlFor="requirements" className="block text-sm font-bold text-slate-700 mb-2">
                                    Job Requirements & Description
                                </label>
                                <textarea
                                    id="requirements"
                                    value={requirements}
                                    onChange={(e) => setRequirements(e.target.value)}
                                    rows={8}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all font-medium"
                                    placeholder="Paste the job description here. Be detailed for better AI screening questions."
                                    required
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={isGenerating}
                                className="w-full bg-slate-900 text-white py-4 px-6 rounded-xl hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-500 disabled:opacity-50 disabled:cursor-not-allowed font-black text-lg shadow-xl shadow-slate-200 active:scale-[0.98] transition-all"
                            >
                                {isGenerating ? (
                                    <div className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Constructing Portal...
                                    </div>
                                ) : (
                                    'Generate Application Portal'
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    )
}
