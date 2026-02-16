require('dotenv').config()

const express = require('express')
const cors = require('cors')
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const helmet = require('helmet')
const rateLimit = require('express-rate-limit')

// Services
const geminiService = require('./services/gemini')
const supabase = require('./lib/supabase')
const fileParser = require('./services/fileParser')
const interviewService = require('./services/interview')

// UUID validation helper
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

async function analyzeCandidate(jobRequirements, formData, resumeText = '') {
  try {
    const analysis = await geminiService.analyzeCandidate(jobRequirements, resumeText, formData)

    if (!analysis || typeof analysis.score === 'undefined') {
      throw new Error('Invalid analysis result from Gemini Service')
    }

    return {
      score: analysis.score,
      strengths: analysis.strengths || ['Completed comprehensive application'],
      concerns: analysis.concerns || [],
      recommendation: analysis.recommendation || 'Consider for interview based on qualifications',
      summary: analysis.explanation || 'Candidate analysis completed successfully'
    }
  } catch (error) {
    console.error('Gemini analysis failed, using fallback:', error.message)

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

// ── Security Middleware ──────────────────────────────────────
app.use(helmet())

// CORS — whitelist allowed origins
const allowedOrigins = [
  process.env.FRONTEND_URL,
  'http://localhost:3000',
  'http://localhost:3001'
].filter(Boolean)

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, server-to-server)
    if (!origin || allowedOrigins.some(o => origin.startsWith(o))) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}))

// Rate limiting — general
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, error: 'Too many requests, please try again later.' }
})

// Rate limiting — strict for AI-heavy endpoints
const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, error: 'Rate limit exceeded for this action.' }
})

app.use('/api/', generalLimiter)

app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))

// Configure multer for file uploads with size limit
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB max
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document']
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true)
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'), false)
    }
  }
})

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
app.post('/api/jobs/create', strictLimiter, async (req, res) => {
  try {
    const { jobTitle, requirements, employerId } = req.body

    if (!jobTitle || !requirements) {
      return res.status(400).json({
        success: false,
        error: 'Job title and requirements are required'
      })
    }

    if (!employerId || !UUID_REGEX.test(employerId)) {
      return res.status(400).json({
        success: false,
        error: 'A valid employerId is required to create a job'
      })
    }

    const formFields = await generateJobForm(jobTitle, requirements)

    const { data: job, error } = await supabase
      .from('jobs')
      .insert({
        title: jobTitle,
        requirements: requirements,
        form_fields: formFields,
        employer_id: employerId
      })
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      jobId: job.id,
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

// Extract job details from file
app.post('/api/jobs/extract', upload.single('jobFile'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No file uploaded' });
    }

    console.log(`📄 Extracting job details from: ${req.file.originalname}`);
    const extractedText = await fileParser.extractText(req.file.path, req.file.mimetype);

    if (!extractedText || extractedText.length < 50) {
      return res.status(400).json({ success: false, error: 'Could not extract sufficient text from file' });
    }

    const jobDetails = await geminiService.extractJobDetails(extractedText);

    res.json({
      success: true,
      jobTitle: jobDetails.jobTitle,
      requirements: jobDetails.requirements
    });
  } catch (error) {
    console.error('❌ Job extraction error:', error);
    res.status(500).json({ success: false, error: 'Failed to extract job details' });
  }
});

// Job routes
app.get('/api/jobs', async (req, res) => {
  const { employerId } = req.query;

  console.log(`[API] Fetching jobs. Query Params:`, req.query);

  let query = supabase.from('jobs').select('*');

  if (employerId) {
    // Basic UUID format check
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (uuidRegex.test(employerId)) {
      console.log(`[API] Applying strict employer filter: ${employerId}`);
      query = query.eq('employer_id', employerId);
    } else {
      console.warn(`[API] Invalid employerId format received: "${employerId}". Filtering for empty results to be safe.`);
      // If an invalid ID is provided, we should probably return nothing or an error
      // instead of falling back to ALL jobs.
      query = query.eq('employer_id', '00000000-0000-0000-0000-000000000000');
    }
  } else {
    console.log(`[API] No employerId provided. Returning all public jobs (Candidate View).`);
  }

  const { data: jobs, error } = await query.order('created_at', { ascending: false });

  if (error) {
    console.error(`[API] Database error fetching jobs:`, error.message);
    return res.status(500).json({ success: false, error: error.message });
  }

  console.log(`[API] Successfully retrieved ${jobs.length} jobs.`);

  res.json({
    success: true,
    jobs: jobs.map(job => ({
      id: job.id,
      title: job.title,
      requirements: job.requirements,
      created_at: job.created_at,
      employerId: job.employer_id
    }))
  })
})

app.get('/api/jobs/:jobId', async (req, res) => {
  const { jobId } = req.params
  const { employerId } = req.query

  let query = supabase
    .from('jobs')
    .select('*')
    .eq('id', jobId);

  if (employerId) {
    query = query.eq('employer_id', employerId);
  }

  const { data: job, error } = await query.single();

  if (error || !job) {
    return res.status(404).json({
      success: false,
      error: 'Job not found or access denied'
    })
  }

  res.json({
    success: true,
    job: {
      ...job,
      jobTitle: job.title,
      formFields: job.form_fields
    }
  })
})

// Application submission
app.post('/api/applications/submit', strictLimiter, upload.single('resume'), async (req, res) => {
  try {
    console.log('📝 Application submission received')

    const { jobId } = req.body

    // Fetch job from Supabase instead of in-memory array
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
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
      formData = { ...req.body }
      delete formData.jobId
    }

    let resumeText = ''
    if (req.file) {
      resumeText = `Resume file: ${req.file.originalname}`
    }

    console.log('🔍 Starting AI analysis process...')

    // Extract text from resume if file exists
    if (req.file) {
      try {
        const fileParser = require('./services/fileParser')
        const extractedText = await fileParser.extractText(req.file.path, req.file.mimetype)
        if (extractedText && extractedText.length > 50) {
          resumeText = extractedText
          console.log(`✅ Resume text extracted: ${resumeText.substring(0, 100)}... (${resumeText.length} chars)`)
        } else {
          console.log('⚠️ Resume text extraction returned empty or too short')
        }
      } catch (parseError) {
        console.error('❌ Resume parsing error:', parseError)
      }
    }

    const analysis = await analyzeCandidate(job.requirements, formData, resumeText)
    console.log('✅ AI analysis process finished')

    const { data: application, error: appError } = await supabase
      .from('applications')
      .insert({
        job_id: jobId,
        name: formData.name || 'Unknown',
        email: formData.email || 'unknown@example.com',
        form_data: formData,
        resume_url: req.file ? req.file.filename : null,
        score: analysis.score || 0,
        explanation: analysis.summary || analysis.explanation,
        strengths: analysis.strengths,
        concerns: analysis.concerns,
        recommendation: analysis.recommendation,
        status: 'PENDING'
      })
      .select()
      .single();

    if (appError) throw appError;

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

// Get applications for a job (ownership required)
app.get('/api/jobs/:jobId/applicants', async (req, res) => {
  const { jobId } = req.params
  const { employerId } = req.query

  if (!employerId || !UUID_REGEX.test(employerId)) {
    return res.status(400).json({ success: false, error: 'A valid employerId is required' });
  }

  try {
    // Verify the job belongs to the employer
    const { data: job, error: jobError } = await supabase
      .from('jobs')
      .select('id')
      .eq('id', jobId)
      .eq('employer_id', employerId)
      .single();

    if (jobError || !job) {
      return res.status(403).json({ success: false, error: 'Access denied' });
    }

    const { data: jobApplications, error } = await supabase
      .from('applications')
      .select('*')
      .eq('job_id', jobId)
      .order('score', { ascending: false });

    if (error) {
      return res.status(500).json({ success: false, error: error.message });
    }

    res.json({
      success: true,
      applicants: jobApplications.map(app => ({
        id: app.id,
        formData: app.form_data,
        resumeFile: app.resume_url,
        analysis: {
          score: app.score,
          strengths: app.strengths,
          concerns: app.concerns,
          recommendation: app.recommendation,
          summary: app.explanation
        },
        interviewAssessment: app.interview_assessment,
        interviewTranscript: app.interview_transcript,
        status: app.status,
        submittedAt: app.created_at
      }))
    })
  } catch (err) {
    res.status(500).json({ success: false, error: 'Internal server error' });
  }
})

// === INTERVIEW ROUTES ===

// Get Application Status (Candidate View)
app.post('/api/candidate/status', async (req, res) => {
  const { email } = req.body;

  // Find all applications for this email
  const { data: applications, error } = await supabase
    .from('applications')
    .select('*, jobs(title)')
    .eq('email', email)
    .order('created_at', { ascending: false });

  if (error || !applications || applications.length === 0) {
    return res.json({ success: false, message: "No applications found for this email" });
  }

  res.json({
    success: true,
    applications: applications.map(app => ({
      id: app.id,
      jobTitle: app.jobs?.title,
      status: app.status,
      candidateName: app.name,
      interviewAssessment: app.interview_assessment,
      submittedAt: app.created_at
    }))
  });
});

// Update Application Status (Employer View)
app.post('/api/applications/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  const { error } = await supabase
    .from('applications')
    .update({ status })
    .eq('id', id);

  if (error) return res.status(500).json({ success: false, error: error.message });

  res.json({ success: true, status });
});

// Start Interview Session
app.post('/api/interview/start', strictLimiter, async (req, res) => {
  const { applicationId } = req.body;
  console.log(`[Interview] Received request to start session for: ${applicationId}`);

  try {
    const { data: app, error } = await supabase
      .from('applications')
      .select('*, jobs(title)')
      .eq('id', applicationId)
      .single();

    if (error || !app) {
      console.error(`[Interview] Application not found: ${applicationId}`, error);
      return res.status(404).json({ success: false, error: "Application not found" });
    }

    const applicationData = {
      jobTitle: app.jobs?.title || 'Unknown Job',
      candidateName: app.name,
      summary: app.explanation || 'Application review',
      strengths: app.strengths || [],
      concerns: app.concerns || []
    };

    const greeting = await interviewService.startInterview(applicationId, applicationData);
    res.json({ success: true, message: greeting });
  } catch (err) {
    console.error(`[Interview] System error starting interview:`, err);
    res.status(500).json({ success: false, error: "Failed to initialize interview service" });
  }
});

// Chat in Interview
app.post('/api/interview/chat', async (req, res) => {
  const { applicationId, message } = req.body;
  console.log(`[Interview] Chat turn for session: ${applicationId}`);

  try {
    const response = await interviewService.processResponse(applicationId, message);
    res.json({ success: true, message: response });
  } catch (e) {
    console.warn(`[Interview] Chat processing failed: ${e.message}`);
    res.status(500).json({ success: false, error: e.message });
  }
});

// End Interview
app.post('/api/interview/end', async (req, res) => {
  const { applicationId } = req.body;
  console.log(`[Interview] Ending session for: ${applicationId}`);

  try {
    const result = await interviewService.endInterview(applicationId);

    if (result) {
      // Save transcript and assessment to DB
      await supabase
        .from('applications')
        .update({
          interview_transcript: result.transcript,
          interview_assessment: result.assessment,
          status: 'INTERVIEW_COMPLETED'
        })
        .eq('id', applicationId);

      res.json({ success: true, assessment: result.assessment });
    } else {
      console.warn(`[Interview] End requested for missing session: ${applicationId}`);
      res.status(400).json({ success: false, error: "Interview session has expired. Your progress might not have been fully saved." });
    }
  } catch (err) {
    console.error(`[Interview] Error finalizing interview:`, err);
    res.status(500).json({ success: false, error: "Failed to save interview results" });
  }
});

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

// Serve resume files (with path traversal protection)
app.get('/api/resumes/:filename', (req, res) => {
  const filename = path.basename(req.params.filename) // sanitize — strip any directory components
  const filePath = path.join(uploadsDir, filename)

  // Ensure resolved path stays within uploads directory
  if (!filePath.startsWith(uploadsDir)) {
    return res.status(403).json({ success: false, error: 'Access denied' })
  }

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
