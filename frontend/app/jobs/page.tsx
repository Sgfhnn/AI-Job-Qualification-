'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
const API_BASE_URL = 'https://ai-job-qualification.onrender.com'

interface Job {
  id: string
  title: string
  requirements: string
  created_at: string
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/jobs`)
      const data = await response.json()
      
      if (data.success) {
        setJobs(data.jobs)
      }
    } catch (error) {
      console.error('Error fetching jobs:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading available jobs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">Available Jobs</h1>
            <p className="text-lg text-gray-600">
              Browse and apply to open positions
            </p>
          </div>

          {jobs.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-8 text-center">
              <p className="text-gray-500 text-lg mb-4">No jobs available at the moment</p>
              <p className="text-sm text-gray-400">Check back later for new opportunities</p>
            </div>
          ) : (
            <div className="grid gap-6">
              {jobs.map((job) => (
                <div key={job.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <h2 className="text-xl font-semibold text-gray-900 mb-3">{job.title}</h2>
                      <p className="text-gray-600 mb-4 leading-relaxed">
                        {job.requirements.length > 200 
                          ? `${job.requirements.substring(0, 200)}...` 
                          : job.requirements
                        }
                      </p>
                      <p className="text-sm text-gray-400">
                        Posted {new Date(job.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="ml-6">
                      <Link
                        href={`/apply/${job.id}`}
                        className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium"
                      >
                        Apply Now
                      </Link>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
