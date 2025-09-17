'use client'

import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
const API_BASE_URL = 'https://ai-job-qualification.onrender.com'

interface FormField {
  name: string
  type: string
  label: string
  required: boolean
  placeholder?: string
  options?: string[]
}

interface Job {
  id: string
  jobTitle: string
  requirements: string
  formFields: FormField[]
}

export default function ApplyPage() {
  const params = useParams()
  const jobId = params.jobId as string
  const [job, setJob] = useState<Job | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [resume, setResume] = useState<File | null>(null)
  const [resumeUploaded, setResumeUploaded] = useState(false)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  useEffect(() => {
    fetchJob()
  }, [jobId])

  const fetchJob = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs/${jobId}`)
      const data = await response.json()
      
      console.log('API Response:', data) // Debug log
      
      if (data.success && data.job) {
        // Handle both old and new data structures
        const jobData = {
          id: data.job.id,
          jobTitle: data.job.jobTitle || data.job.title,
          requirements: data.job.requirements,
          formFields: data.job.formFields || data.job.form_fields || []
        }
        
        setJob(jobData)
        
        // Initialize form data only if formFields exists and is an array
        const initialData: Record<string, any> = {}
        if (jobData.formFields && Array.isArray(jobData.formFields)) {
          jobData.formFields.forEach((field: FormField) => {
            initialData[field.name] = field.type === 'checkbox' ? false : ''
          })
        }
        setFormData(initialData)
      } else {
        console.error('Invalid job data structure:', data)
      }
    } catch (error) {
      console.error('Error fetching job:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (name: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0]
      const maxSize = 10 * 1024 * 1024 // 10MB
      const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
      
      if (file.size > maxSize) {
        setUploadError('File size must be less than 10MB')
        setResumeUploaded(false)
        return
      }
      
      if (!allowedTypes.includes(file.type)) {
        setUploadError('Only PDF, DOC, and DOCX files are allowed')
        setResumeUploaded(false)
        return
      }
      
      setResume(file)
      setResumeUploaded(true)
      setUploadError(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const submitData = new FormData()
      submitData.append('jobId', jobId)
      submitData.append('formData', JSON.stringify(formData))
      if (resume) {
        submitData.append('resume', resume)
      }

      const response = await fetch(`${API_BASE_URL}/api/applications/submit`, {
        method: 'POST',
        body: submitData,
      })

      const data = await response.json()
      
      if (data.success) {
        setSubmitted(true)
      } else {
        alert('Error submitting application: ' + data.error)
      }
    } catch (error) {
      console.error('Error:', error)
      alert('Error submitting application')
    } finally {
      setSubmitting(false)
    }
  }

  const renderFormField = (field: FormField) => {
    switch (field.type) {
      case 'text':
      case 'email':
      case 'number':
        return (
          <input
            type={field.type}
            value={formData[field.name] || ''}
            placeholder={field.placeholder || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={field.required}
          />
        )
      
      case 'textarea':
        return (
          <textarea
            value={formData[field.name] || ''}
            placeholder={field.placeholder || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={field.required}
          />
        )
      
      case 'select':
        return (
          <select
            value={formData[field.name] || ''}
            onChange={(e) => handleInputChange(field.name, e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            required={field.required}
          >
            <option value="">Select an option</option>
            {field.options?.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        )
      
      case 'checkbox':
        return (
          <input
            type="checkbox"
            checked={formData[field.name] || false}
            onChange={(e) => handleInputChange(field.name, e.target.checked)}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
        )
      
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading application form...</p>
        </div>
      </div>
    )
  }

  if (!job) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Job Not Found</h1>
          <p className="text-gray-600">This job posting may have been removed or the link is invalid.</p>
        </div>
      </div>
    )
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Application Submitted!</h2>
          <p className="text-gray-600 mb-6">
            Thank you for applying to {job.jobTitle}. Your application has been received and will be reviewed by our AI system.
          </p>
          <p className="text-sm text-gray-500">
            You will be contacted if you're selected for the next round.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {/* Header */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">{job.jobTitle}</h1>
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-medium text-gray-900 mb-2">Job Requirements:</h3>
              <p className="text-gray-700 text-sm leading-relaxed">{job.requirements}</p>
            </div>
          </div>

          {/* Application Form */}
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Application Form</h2>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Resume Upload */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Resume Upload *
                </label>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
                {resumeUploaded && (
                  <div className="mt-2 flex items-center text-green-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-sm">Resume uploaded successfully: {resume?.name}</span>
                  </div>
                )}
                {uploadError && (
                  <div className="mt-2 flex items-center text-red-600">
                    <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                    <span className="text-sm">{uploadError}</span>
                  </div>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Accepted formats: PDF, DOC, DOCX (Max 10MB)
                </p>
              </div>

              {/* Dynamic Form Fields */}
              {job.formFields && job.formFields.length > 0 ? (
                job.formFields.map((field) => (
                  <div key={field.name}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {field.label} {field.required && '*'}
                    </label>
                    {renderFormField(field)}
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-gray-500">
                  No form fields available
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
              >
                {submitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting Application...
                  </div>
                ) : (
                  'Submit Application'
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}
