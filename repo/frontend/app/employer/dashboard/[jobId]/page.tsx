'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
const API_BASE_URL = 'https://ai-job-qualification.onrender.com'
import Link from 'next/link'

// Toast Component
const Toast = ({ message, type = 'success', onClose }: { message: string, type?: 'success' | 'error', onClose: () => void }) => {
  return (
    <div className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-md ${
      type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
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

interface Applicant {
  id: string
  formData: any
  resumeFile?: string
  resumeOriginalName?: string
  analysis: {
    score: number
    strengths: string[]
    concerns: string[]
    recommendation: string
    summary: string
  }
  submittedAt: string
}

interface Job {
  id: string
  jobTitle: string
  requirements: string
  formFields: any[]
  createdAt: string
}

export default function EmployerDashboard() {
  const params = useParams()
  const jobId = params.jobId as string
  const [job, setJob] = useState<Job | null>(null)
  const [applicants, setApplicants] = useState<Applicant[]>([])
  const [loading, setLoading] = useState(true)
  const [sortBy, setSortBy] = useState<'score' | 'date'>('score')
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    fetchJobAndApplicants()
  }, [jobId])

  const fetchJobAndApplicants = async () => {
    try {
      const [jobResponse, applicantsResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/api/jobs/${jobId}`),
        fetch(`${API_BASE_URL}/api/jobs/${jobId}/applicants`)
      ])

      const jobData = await jobResponse.json()
      const applicantsData = await applicantsResponse.json()

      console.log('Job Data:', jobData)
      console.log('Applicants Data:', applicantsData)

      if (jobData.success) {
        // Handle both old and new data structures
        const job = {
          id: jobData.job.id,
          jobTitle: jobData.job.jobTitle || jobData.job.title,
          requirements: jobData.job.requirements,
          formFields: jobData.job.formFields || jobData.job.form_fields || [],
          createdAt: jobData.job.createdAt || jobData.job.created_at
        }
        setJob(job)
      }
      
      if (applicantsData.success && applicantsData.applicants) {
        // Ensure each applicant has proper structure
        const processedApplicants = applicantsData.applicants.map(applicant => ({
          ...applicant,
          formData: applicant.formData || applicant.form_data || {},
          analysis: applicant.analysis || {
            score: 0,
            strengths: [],
            concerns: [],
            recommendation: 'Analysis not available',
            summary: 'AI analysis failed or is pending'
          }
        }))
        setApplicants(processedApplicants)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null)
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  const sortedApplicants = [...applicants].sort((a, b) => {
    if (sortBy === 'score') {
      const scoreA = a.analysis?.score || 0
      const scoreB = b.analysis?.score || 0
      return scoreB - scoreA
    } else {
      const dateA = new Date(a.submittedAt).getTime()
      const dateB = new Date(b.submittedAt).getTime()
      return (isNaN(dateB) ? 0 : dateB) - (isNaN(dateA) ? 0 : dateA)
    }
  })

  const copyShareUrl = async () => {
    try {
      const url = `${window.location.origin}/apply/${job.id}`
      await navigator.clipboard.writeText(url)
      setToast({
        message: '✅ Share URL copied to clipboard!\nReady to share with candidates.',
        type: 'success'
      })
    } catch (error) {
      console.error('Failed to copy URL:', error)
      setToast({
        message: '❌ Failed to copy URL.\nPlease try again.',
        type: 'error'
      })
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <Link href="/employer" className="text-blue-600 hover:underline">
            Create a new job
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-6 mb-6 md:mb-8">
          <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start space-y-4 lg:space-y-0">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">{job.jobTitle}</h1>
              <p className="text-gray-600 mb-4 text-sm md:text-base">Job ID: {job.id}</p>
              <div className="flex flex-col sm:flex-row items-start sm:items-center space-y-2 sm:space-y-0 sm:space-x-4">
                <button
                  onClick={copyShareUrl}
                  className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors text-sm md:text-base"
                >
                  Copy Share URL
                </button>
                <Link
                  href={`/apply/${job.id}`}
                  target="_blank"
                  className="w-full sm:w-auto bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors text-center text-sm md:text-base"
                >
                  Preview Form
                </Link>
              </div>
            </div>
            <div className="w-full lg:w-auto lg:text-right">
              <div className="grid grid-cols-2 gap-4 text-center">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs md:text-sm text-gray-500">Total Applicants</p>
                  <p className="text-xl md:text-2xl font-bold text-blue-600">{applicants.length}</p>
                </div>
                <div className="bg-green-50 p-3 rounded-lg">
                  <p className="text-xs md:text-sm text-gray-500">Avg Score</p>
                  <p className="text-xl md:text-2xl font-bold text-green-600">
                    {applicants.length > 0 ? Math.round(applicants.reduce((sum, app) => sum + (app.analysis?.score || 0), 0) / applicants.length) : 0}%
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">Applicants</h2>
            <div className="flex items-center space-x-2 sm:space-x-4">
              <label className="text-xs md:text-sm text-gray-600">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'score' | 'date')}
                className="border border-gray-300 rounded-md px-3 py-1 text-xs md:text-sm"
              >
                <option value="score">Highest Score</option>
                <option value="date">Most Recent</option>
              </select>
            </div>
          </div>
        </div>

        {/* Applicants List */}
        {applicants.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500 text-lg mb-4">No applicants yet</p>
            <p className="text-sm text-gray-400">Share your job form URL to start receiving applications</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sortedApplicants.map((applicant, index) => (
              <div key={applicant.id} className="bg-white rounded-lg shadow-sm p-4 md:p-6 border-l-4 border-blue-500">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between space-y-4 lg:space-y-0">
                  <div className="flex-1">
                    {/* Mobile-first header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                      <div className="flex items-center space-x-2 mb-2 sm:mb-0">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                          #{index + 1}
                        </span>
                        <h3 className="text-base md:text-lg font-semibold text-gray-900">{applicant.formData?.name || 'Unknown'}</h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs md:text-sm text-gray-500">{applicant.formData?.email || 'No email'}</span>
                        <div className={`px-2 md:px-3 py-1 rounded-full text-xs md:text-sm font-medium ${
                          (applicant.analysis?.score || 0) >= 80 ? 'bg-green-100 text-green-800' :
                          (applicant.analysis?.score || 0) >= 60 ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                          {applicant.analysis?.score || 0}% Match
                        </div>
                        <div className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded">
                          Rank {index + 1}
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <h4 className="text-xs md:text-sm font-medium text-gray-700 mb-2">AI Analysis:</h4>
                      {applicant.analysis && applicant.analysis.score !== undefined ? (
                        <>
                          <div className="flex items-center mb-2">
                            <div className={`w-2 h-2 rounded-full mr-2 ${
                              applicant.analysis.score >= 80 ? 'bg-green-500' :
                              applicant.analysis.score >= 60 ? 'bg-yellow-500' :
                              'bg-red-500'
                            }`}></div>
                            <p className="text-xs md:text-sm text-gray-600 leading-relaxed">{applicant.analysis.summary || 'Analysis completed'}</p>
                          </div>
                          <div className="text-xs text-gray-500 space-y-1">
                            {applicant.analysis.strengths && applicant.analysis.strengths.length > 0 && (
                              <div>
                                <span className="font-medium text-green-600">Strengths:</span> {applicant.analysis.strengths.join(', ')}
                              </div>
                            )}
                            {applicant.analysis.concerns && applicant.analysis.concerns.length > 0 && (
                              <div>
                                <span className="font-medium text-red-600">Concerns:</span> {applicant.analysis.concerns.join(', ')}
                              </div>
                            )}
                            {applicant.analysis.recommendation && (
                              <div>
                                <span className="font-medium">Recommendation:</span> {applicant.analysis.recommendation}
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <div className="flex items-center text-xs md:text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-md p-2">
                          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 15.5c-.77.833.192 2.5 1.732 2.5z" />
                          </svg>
                          <span>AI analysis pending or failed - manual review required</span>
                        </div>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 md:gap-4 text-xs md:text-sm">
                      {applicant.formData && Object.keys(applicant.formData).length > 0 ? (
                        Object.entries(applicant.formData).map(([key, value]) => (
                          <div key={key} className="break-words">
                            <span className="font-medium text-gray-700 capitalize">{key.replace('_', ' ')}: </span>
                            <span className="text-gray-600">{String(value)}</span>
                          </div>
                        ))
                      ) : (
                        <div className="col-span-full text-center text-gray-500 italic">
                          No form data available
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex flex-row lg:flex-col items-start lg:items-end justify-between lg:justify-start lg:ml-6 space-x-2 lg:space-x-0 lg:space-y-2">
                    {applicant.resumeFile && (
                      <div className="bg-blue-50 border border-blue-200 text-blue-700 px-3 py-1 rounded-md text-xs md:text-sm">
                        <a 
                          href={`${API_BASE_URL}/api/resumes/${applicant.resumeFile}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center space-x-1 hover:underline"
                        >
                          <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span>Resume: {applicant.resumeOriginalName || applicant.resumeFile}</span>
                        </a>
                      </div>
                    )}
                    {!applicant.resumeFile && (
                      <div className="bg-gray-100 text-gray-500 px-3 py-1 rounded-md text-xs md:text-sm">
                        No resume uploaded
                      </div>
                    )}
                    <p className="text-xs text-gray-400 whitespace-nowrap">
                      Applied {applicant.submittedAt && !isNaN(new Date(applicant.submittedAt).getTime()) 
                        ? new Date(applicant.submittedAt).toLocaleDateString() 
                        : 'Date not available'}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
