const express = require('express')
const router = express.Router()
const supabase = require('../config/supabase')
const geminiService = require('../services/gemini')
const { v4: uuidv4 } = require('uuid')

// Create a new job with AI-generated form - MUST be before /:jobId route
router.post('/create', async (req, res) => {
  try {
    const { jobTitle, requirements } = req.body

    if (!jobTitle || !requirements) {
      return res.status(400).json({
        success: false,
        error: 'Job title and requirements are required'
      })
    }

    console.log('Creating job:', jobTitle)
    console.log('Requirements:', requirements.substring(0, 100) + '...')

    // Generate form fields using AI
    const formFields = await geminiService.generateFormFields(jobTitle, requirements)
    console.log('Generated form fields:', formFields.length, 'fields')

    // Create job in database
    const jobId = uuidv4()
    const { data, error } = await supabase
      .from('jobs')
      .insert({
        id: jobId,
        title: jobTitle,
        requirements: requirements,
        form_fields: formFields,
        created_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to create job'
      })
    }

    res.json({
      success: true,
      jobId: jobId,
      formFields: formFields
    })
  } catch (error) {
    console.error('Error creating job:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// Get all jobs
router.get('/', async (req, res) => {
  try {
    const { data, error } = await supabase
      .from('jobs')
      .select('id, title, requirements, created_at')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch jobs'
      })
    }

    res.json({
      success: true,
      jobs: data || []
    })
  } catch (error) {
    console.error('Error fetching jobs:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// Get specific job (must be after /create route to avoid conflicts)
router.get('/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params

    // Validate UUID format to prevent "create" being treated as jobId
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(jobId)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid job ID format'
      })
    }

    const { data, error } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (error) {
      console.error('Database error:', error)
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      })
    }

    res.json({
      success: true,
      job: data
    })
  } catch (error) {
    console.error('Error fetching job:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// Get applicants for a job
router.get('/:jobId/applicants', async (req, res) => {
  try {
    const { jobId } = req.params

    const { data, error } = await supabase
      .from('applications')
      .select('*')
      .eq('job_id', jobId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch applicants'
      })
    }

    // Transform database fields to match frontend expectations
    const transformedApplicants = (data || []).map(applicant => ({
      id: applicant.id,
      formData: applicant.form_data,
      resumeFile: applicant.resume_file,
      resumeOriginalName: applicant.resume_original_name,
      analysis: {
        score: applicant.score || 0,
        strengths: [],
        concerns: [],
        recommendation: applicant.explanation || 'Analysis not available',
        summary: applicant.explanation || 'Analysis not available'
      },
      submittedAt: applicant.submitted_at || applicant.created_at
    }))

    res.json({
      success: true,
      applicants: transformedApplicants
    })
  } catch (error) {
    console.error('Error fetching applicants:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

module.exports = router
