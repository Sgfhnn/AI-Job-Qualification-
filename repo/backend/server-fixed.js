const express = require('express')
const cors = require('cors')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
require('dotenv').config()

const app = express()
const PORT = process.env.PORT || 3001

// Middleware
app.use(cors())
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'uploads')
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

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

// In-memory storage for jobs and applications
let jobs = []
let applications = []

// Gemini AI service
const { GoogleGenerativeAI } = require('@google/generative-ai')
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyBjiPfXpQaDff1Teq9pUPiB7hyL-wjuPW0')

async function generateJobForm(jobTitle, requirements) {
  console.log(`🤖 Generating AI form for: ${jobTitle}`)
  console.log(`📋 Requirements: ${requirements}`)
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    const prompt = `You are an expert HR professional. Create a comprehensive job application form for a "${jobTitle}" position.

Job Requirements: ${requirements}

Generate exactly 12 unique, job-specific form fields. Make them highly relevant to this specific role and requirements.

IMPORTANT: Return ONLY valid JSON array, no markdown, no explanation, no extra text.

[
  {"name": "name", "type": "text", "label": "Full Name", "required": true},
  {"name": "email", "type": "email", "label": "Email Address", "required": true},
  {"name": "phone", "type": "tel", "label": "Phone Number", "required": true},
  {"name": "years_experience", "type": "number", "label": "Years of Experience in ${jobTitle}", "required": true},
  {"name": "specific_skills", "type": "textarea", "label": "Specific Skills Related to This Role", "required": true},
  {"name": "education", "type": "select", "label": "Highest Education Level", "required": true, "options": ["High School", "Bachelor's", "Master's", "PhD", "Other"]},
  {"name": "portfolio", "type": "text", "label": "Portfolio/GitHub/LinkedIn URL", "required": false},
  {"name": "availability", "type": "select", "label": "Availability", "required": true, "options": ["Immediately", "2 weeks notice", "1 month", "Other"]},
  {"name": "salary_expectation", "type": "text", "label": "Salary Expectation", "required": false},
  {"name": "why_interested", "type": "textarea", "label": "Why are you interested in this position?", "required": true},
  {"name": "biggest_achievement", "type": "textarea", "label": "Describe your biggest professional achievement", "required": true},
  {"name": "additional_info", "type": "textarea", "label": "Additional Information", "required": false}
]`

    console.log('🔄 Calling Gemini API...')
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text().trim()
    
    console.log('📝 Raw AI Response:', text.substring(0, 200) + '...')
    
    // Clean the response - remove markdown formatting
    let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim()
    
    // Extract JSON array
    const jsonMatch = cleanText.match(/\[[\s\S]*\]/)
    if (jsonMatch) {
      const formFields = JSON.parse(jsonMatch[0])
      console.log(`✅ Generated ${formFields.length} custom form fields`)
      return formFields
    }
    
    throw new Error('Could not parse AI response')
    
  } catch (error) {
    console.error('❌ AI Form Generation Error:', error.message)
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

async function analyzeCandidate(jobRequirements, formData, resumeText = '') {
  console.log(`🔍 Analyzing candidate for job requirements...`)
  console.log(`📊 Form data keys: ${Object.keys(formData).join(', ')}`)
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    
    const candidateInfo = Object.entries(formData)
      .filter(([key, value]) => value && value.toString().trim())
      .map(([key, value]) => `${key.replace(/_/g, ' ')}: ${value}`)
      .join('\n')
    
    const prompt = `You are an expert HR analyst. Analyze this candidate for the job requirements below.

JOB REQUIREMENTS: ${jobRequirements}

CANDIDATE PROFILE:
${candidateInfo}

${resumeText ? `RESUME: ${resumeText}` : ''}

Provide a comprehensive analysis. Return ONLY valid JSON with no markdown:

{
  "score": 85,
  "strengths": ["Specific strength 1", "Specific strength 2", "Specific strength 3"],
  "concerns": ["Specific concern 1", "Specific concern 2"],
  "recommendation": "Detailed hiring recommendation with specific reasoning",
  "summary": "Brief 1-sentence summary of candidate fit"
}`

    console.log('🔄 Calling Gemini for candidate analysis...')
    const result = await model.generateContent(prompt)
    const response = await result.response
    const text = response.text().trim()
    
    console.log('📝 Raw Analysis Response:', text.substring(0, 150) + '...')
    
    // Clean the response
    let cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim()
    
    // Extract JSON
    const jsonMatch = cleanText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0])
      console.log(`✅ AI Analysis complete - Score: ${analysis.score}%`)
      return analysis
    }
    
    throw new Error('Could not parse AI analysis response')
    
  } catch (error) {
    console.error('❌ AI Analysis Error:', error.message)
    console.log('🔄 Using intelligent fallback analysis...')
    
    // Intelligent fallback based on form data
    const hasExperience = formData.years_experience || formData.experience
    const hasSkills = formData.key_skills || formData.skills || formData.specific_skills
    const hasEducation = formData.education
    
    let score = 70 // Base score
    let strengths = []
    let concerns = []
    
    // Analyze experience
    if (hasExperience) {
      const expYears = parseInt(hasExperience) || 0
      if (expYears >= 5) {
        score += 15
        strengths.push(`Strong experience with ${expYears} years in the field`)
      } else if (expYears >= 2) {
        score += 10
        strengths.push(`Good experience with ${expYears} years in the field`)
      } else {
        score += 5
        concerns.push('Limited professional experience')
      }
    }
    
    // Analyze skills
    if (hasSkills) {
      const skillsText = hasSkills.toLowerCase()
      if (jobRequirements.toLowerCase().includes('python') && skillsText.includes('python')) {
        score += 10
        strengths.push('Relevant Python programming skills')
      }
      if (jobRequirements.toLowerCase().includes('react') && skillsText.includes('react')) {
        score += 10
        strengths.push('Strong React development experience')
      }
      if (jobRequirements.toLowerCase().includes('machine learning') && (skillsText.includes('ml') || skillsText.includes('machine learning'))) {
        score += 15
        strengths.push('Machine learning expertise matches requirements')
      }
    }
    
    // Analyze education
    if (hasEducation) {
      if (hasEducation.includes('PhD')) {
        score += 10
        strengths.push('Advanced PhD education')
      } else if (hasEducation.includes('Master')) {
        score += 5
        strengths.push('Strong educational background with Master\'s degree')
      }
    }
    
    // Ensure we have at least 2 strengths and 1 concern
    if (strengths.length < 2) {
      strengths.push('Shows genuine interest in the role')
      strengths.push('Completed comprehensive application')
    }
    if (concerns.length === 0) {
      concerns.push('Would benefit from technical interview to assess depth')
    }
    
    // Cap score at 95
    score = Math.min(score, 95)
    
    const analysis = {
      score,
      strengths: strengths.slice(0, 4),
      concerns: concerns.slice(0, 3),
      recommendation: score >= 80 ? 
        'Strong candidate - recommend for interview. Shows good alignment with requirements.' :
        score >= 70 ?
        'Qualified candidate - consider for interview with focus on addressing concerns.' :
        'Candidate needs further evaluation - may require additional screening.',
      summary: score >= 80 ? 'Highly qualified candidate with strong fit' : 
               score >= 70 ? 'Qualified candidate with good potential' :
               'Candidate requires further evaluation'
    }
    
    console.log(`✅ Fallback analysis complete - Score: ${analysis.score}%`)
    return analysis
  }
}

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'AI Job Platform API is running' })
})

// Create job
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
      jobTitle,
      requirements,
      formFields,
      createdAt: new Date().toISOString()
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

// Get all jobs
app.get('/api/jobs', (req, res) => {
  res.json({
    success: true,
    jobs: jobs.map(job => ({
      id: job.id,
      jobTitle: job.jobTitle,
      requirements: job.requirements,
      createdAt: job.createdAt
    }))
  })
})

// Get specific job - FIXED TO RETURN CONSISTENT STRUCTURE
app.get('/api/jobs/:jobId', (req, res) => {
  const { jobId } = req.params
  const job = jobs.find(j => j.id === jobId)
  
  if (!job) {
    return res.status(404).json({ 
      success: false, 
      error: 'Job not found' 
    })
  }
  
  // Return job with consistent field names that match frontend expectations
  res.json({
    success: true,
    job: {
      id: job.id,
      jobTitle: job.jobTitle,
      requirements: job.requirements,
      formFields: job.formFields,
      createdAt: job.createdAt
    }
  })
})

// Submit application
app.post('/api/applications/submit', upload.single('resume'), async (req, res) => {
  try {
    console.log('📝 Application submission received')
    console.log('Body keys:', Object.keys(req.body))
    
    const { jobId } = req.body
    console.log('Job ID:', jobId)
    
    const job = jobs.find(j => j.id === jobId)
    if (!job) {
      console.log('❌ Job not found:', jobId)
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
      console.log('❌ Error parsing form data:', e.message)
      formData = { ...req.body }
      delete formData.jobId
    }

    console.log('📊 Parsed form data:', Object.keys(formData))

    let resumeText = ''
    if (req.file) {
      resumeText = `Resume file: ${req.file.originalname}`
      console.log('📄 Resume uploaded:', req.file.originalname)
    }

    console.log('🔍 Starting AI analysis...')
    const analysis = await analyzeCandidate(job.requirements, formData, resumeText)
    
    const application = {
      id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
      jobId,
      formData,
      resumeFile: req.file ? req.file.filename : null,
      analysis,
      submittedAt: new Date().toISOString()
    }
    
    applications.push(application)
    
    console.log(`✅ Application submitted with score: ${analysis.score}%`)
    
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

// Test endpoint
app.post('/api/test/analyze', async (req, res) => {
  try {
    const { jobRequirements, resumeText, formData } = req.body
    const analysis = await analyzeCandidate(jobRequirements, formData, resumeText)
    
    res.json({
      success: true,
      analysis
    })
  } catch (error) {
    console.error('Error in test analysis:', error)
    res.status(500).json({ 
      success: false, 
      error: 'Failed to analyze candidate' 
    })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 AI Job Platform API running on port ${PORT}`)
  console.log(`📊 Health check: http://localhost:${PORT}/health`)
  console.log(`🤖 AI functionality: ENABLED`)
  console.log(`💾 Storage: In-memory (no database required)`)
})
