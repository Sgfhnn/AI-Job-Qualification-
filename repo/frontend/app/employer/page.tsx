'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'https://ai-job-qualification.onrender.com'

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

export default function EmployerPage() {
  const [jobTitle, setJobTitle] = useState('')
  const [requirements, setRequirements] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsGenerating(true)

    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobTitle,
          requirements,
        }),
      })

      const data = await response.json()
      
      if (data.success) {
        // Show success toast
        setToast({
          message: '✅ Job form created successfully!\nRedirecting to dashboard...',
          type: 'success'
        })
        
        // Reset form
        setJobTitle('')
        setRequirements('')
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          window.location.href = `/employer/dashboard/${data.jobId}`
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

  // Auto-dismiss toast after 5 seconds
  React.useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [toast])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Create Job Application Form
            </h1>
            <p className="text-lg text-gray-600">
              Tell our AI about your job requirements and we'll generate a custom application form
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="jobTitle" className="block text-sm font-medium text-gray-700 mb-2">
                  Job Title
                </label>
                <input
                  type="text"
                  id="jobTitle"
                  value={jobTitle}
                  onChange={(e) => setJobTitle(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., Senior Software Engineer"
                  required
                />
              </div>

              <div>
                <label htmlFor="requirements" className="block text-sm font-medium text-gray-700 mb-2">
                  Job Requirements & Description
                </label>
                <textarea
                  id="requirements"
                  value={requirements}
                  onChange={(e) => setRequirements(e.target.value)}
                  rows={8}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Describe the job requirements, skills needed, experience level, education, etc. Be as detailed as possible to help AI generate the best application form."
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isGenerating}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {isGenerating ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Generating Form...
                  </div>
                ) : (
                  'Generate Application Form'
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 text-center">
            <p className="text-sm text-gray-500">
              Our AI will analyze your requirements and create a custom application form with relevant fields
            </p>
            <div className="mt-4 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">
                💡 After creating your form, you'll get:
              </p>
              <ul className="text-sm text-blue-600 mt-2 space-y-1">
                <li>• A shareable application URL for candidates</li>
                <li>• A permanent dashboard URL to track applicants</li>
                <li>• AI-powered candidate ranking and analysis</li>
                <li>• Real-time application notifications</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
