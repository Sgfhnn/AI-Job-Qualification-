require('dotenv').config()

const express = require('express')
const cors = require('cors')
const multer = require('multer')
const path = require('path')
const fs = require('fs')

// In-memory storage for jobs and applications
let jobs = []
let applications = []

// Gemini AI service
const geminiService = require('./services/gemini')

async function analyzeCandidate(jobRequirements, formData, resumeText = '') {
  console.log(`🔍 Starting AI Analysis for candidate...`)
  console.log(`📋 Job Requirements length: ${jobRequirements?.length || 0}`)
  console.log(`📊 Form Data keys: ${Object.keys(formData || {}).join(', ')}`)

  try {
    // IMPORTANT: geminiService.analyzeCandidate expects (jobRequirements, resumeText, formData)
    // Our wrapper receives (jobRequirements, formData, resumeText)
    console.log('📡 Calling Gemini Service...')
    const analysis = await geminiService.analyzeCandidate(jobRequirements, resumeText, formData)

    if (!analysis || typeof analysis.score === 'undefined') {
      throw new Error('Invalid analysis result from Gemini Service')
    }

    console.log(`✅ REAL AI Analysis SUCCESS - Score: ${analysis.score}%`)

    // Ensure consistent format for frontend
    return {
      score: analysis.score,
      strengths: analysis.strengths || ['Completed comprehensive application'],
      concerns: analysis.concerns || [],
      recommendation: analysis.recommendation || 'Consider for interview based on qualifications',
      summary: analysis.explanation || 'Candidate analysis completed successfully'
    }

  } catch (error) {
    console.error('❌ Gemini Service FAILED:', error.message)
    console.log('🔄 Falling back to intelligent local analysis...')

    // Intelligent fallback if API fails
    const exp = formData.years_experience || formData.experience || '0'
    const expYears = parseInt(exp) || 0
    const score = Math.min(90, 60 + (expYears * 5))

    return {
      score,
      strengths: [`${expYears} years of relevant experience`, 'Completed all required form fields'],
      concerns: ['AI service temporarily unavailable - manual verification recommended'],
      recommendation: score >= 75 ? 'Strongly recommend for interview' : 'Consider for initial screening',
      summary: `Local analysis completed. Candidate shows ${expYears} years of experience.`
    }
  }
}

const app = express()
const PORT = process.env.PORT || 10000

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

// FORCE CORS HEADERS - AGGRESSIVE APPROACH
app.use('*', (req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Methods', '*')
  res.header('Access-Control-Allow-Headers', '*')
  res.header('Access-Control-Max-Age', '3600')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }
  next()
})
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({ storage: storage })

// AI Form Generation Function using working service
async function generateJobForm(jobTitle, requirements) {
  console.log(`🤖 Using WORKING Gemini service for form generation: ${jobTitle}`)

  try {
    // Use the working geminiService
    const formFields = await geminiService.generateFormFields(jobTitle, requirements)
    console.log(`✅ Generated ${formFields.length} AI form fields`)
    return formFields

  } catch (error) {
    console.error('❌ Gemini Form Generation Error:', error.message)
    console.log('🔄 Using enhanced fallback form...')

    // Enhanced fallback based on job requirements
    const isEngineer = jobTitle.toLowerCase().includes('engineer') || jobTitle.toLowerCase().includes('developer')
    const isML = jobTitle.toLowerCase().includes('machine learning') || jobTitle.toLowerCase().includes('data')

    let fallbackFields = [
      { name: 'name', type: 'text', label: 'Full Name', required: true },
      { name: 'email', type: 'email', label: 'Email Address', required: true },
      { name: 'phone', type: 'tel', label: 'Phone Number', required: true },
      { name: 'years_experience', type: 'number', label: `Years of Experience as ${jobTitle}`, required: true },
      { name: 'education', type: 'select', label: 'Education Level', required: true, options: ['Bachelor\'s', 'Master\'s', 'PhD', 'Other'] },
      { name: 'key_skills', type: 'textarea', label: 'Key Technical Skills', required: true },
      { name: 'portfolio', type: 'text', label: 'Portfolio/GitHub URL', required: false },
      { name: 'why_interested', type: 'textarea', label: 'Why are you interested in this role?', required: true },
      { name: 'availability', type: 'select', label: 'Availability', required: true, options: ['Immediately', '2 weeks', '1 month'] },
      { name: 'salary_range', type: 'text', label: 'Expected Salary Range', required: false }
    ]

    if (isML) {
      fallbackFields.push(
        { name: 'ml_frameworks', type: 'textarea', label: 'Machine Learning Frameworks Experience', required: true },
        { name: 'research_experience', type: 'textarea', label: 'Research/Publications Experience', required: false }
      )
    } else if (isEngineer) {
      fallbackFields.push(
        { name: 'programming_languages', type: 'textarea', label: 'Programming Languages', required: true },
        { name: 'project_examples', type: 'textarea', label: 'Notable Projects', required: true }
      )
    } else {
      fallbackFields.push(
        { name: 'relevant_experience', type: 'textarea', label: 'Most Relevant Experience', required: true },
        { name: 'achievements', type: 'textarea', label: 'Key Achievements', required: true }
      )
    }

    console.log(`✅ Using ${fallbackFields.length} enhanced fallback fields`)
    return fallbackFields
  }
}

// Create job with AI form generation
app.post('/api/jobs/create', async (req, res) => {
  try {
    const { jobTitle, requirements } = req.body

    if (!jobTitle || !requirements) {
      return res.status(400).json({
        success: false,
        error: 'Job title and requirements are required'
      })
    }

    const jobId = Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9)
    const formFields = await generateJobForm(jobTitle, requirements)

    const job = {
      id: jobId,
      title: jobTitle,
      requirements,
      form_fields: formFields,
      created_at: new Date().toISOString()
    }

    jobs.push(job)

    res.json({
      success: true,
      jobId,
      formFields
    })
  } catch (error) {
    console.error('Error creating job:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create job'
    })
  }
})

// Job routes (in-memory)
app.get('/api/jobs', (req, res) => {
  res.json({
    success: true,
    jobs: jobs.map(job => ({
      id: job.id,
      title: job.title,
      requirements: job.requirements,
      created_at: job.created_at
    }))
  })
})

app.get('/api/jobs/:jobId', (req, res) => {
  const { jobId } = req.params
  const job = jobs.find(j => j.id === jobId)

  if (!job) {
    return res.status(404).json({
      success: false,
      error: 'Job not found'
    })
  }

  res.json({
    success: true,
    job
  })
})

// Application submission (in-memory)
app.post('/api/applications/submit', upload.single('resume'), async (req, res) => {
  try {
    console.log('📝 Application submission received')

    const { jobId } = req.body
    const job = jobs.find(j => j.id === jobId)

    if (!job) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      })
    }

    let formData = {}
    try {
      if (req.body.formData) {
        formData = JSON.parse(req.body.formData)
      } else {
        formData = { ...req.body }
        delete formData.jobId
      }
    } catch (e) {
      formData = { ...req.body }
      delete formData.jobId
    }

    let resumeText = ''
    if (req.file) {
      resumeText = `Resume file: ${req.file.originalname}`
    }

    console.log('🔍 Starting AI analysis process...')
    const analysis = await analyzeCandidate(job.requirements, formData, resumeText)
    console.log('✅ AI analysis process finished')

    const application = {
      id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
      jobId,
      formData,
      resumeFile: req.file ? req.file.filename : null,
      analysis,
      submittedAt: new Date().toISOString()
    }

    applications.push(application)

    res.json({
      success: true,
      applicationId: application.id,
      analysis
    })
  } catch (error) {
    console.error('Error submitting application:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to submit application'
    })
  }
})

// Get applications for a job
app.get('/api/jobs/:jobId/applicants', (req, res) => {
  const { jobId } = req.params
  const jobApplications = applications.filter(app => app.jobId === jobId)

  res.json({
    success: true,
    applicants: jobApplications
  })
})

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'AI Job Platform API is running',
    endpoints: {
      health: '/health',
      jobs: '/api/jobs',
      applications: '/api/applications'
    }
  })
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI Job Platform API is running' })
})

// Debug endpoint
app.get('/api/debug/env', (req, res) => {
  res.json({
    success: true,
    debug: {
      apiUrl: process.env.API_URL || 'Not set',
      geminiApiKey: process.env.GEMINI_API_KEY ? '✅ Set' : '❌ Missing',
      uploadsDirectory: fs.existsSync(uploadsDir) ? '✅ Exists' : '❌ Missing',
      environment: process.env.NODE_ENV || 'development',
      port: PORT,
      uploadsPath: uploadsDir,
      processId: process.pid,
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage()
    }
  })
})

// Serve resume files
app.get('/api/resumes/:filename', (req, res) => {
  const filename = req.params.filename
  const filePath = path.join(uploadsDir, filename)

  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ success: false, error: 'File not found' })
  }

  res.sendFile(filePath)
})

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack)
  res.status(500).json({ success: false, error: 'Something went wrong!' })
})

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ success: false, error: 'Route not found' })
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
})
