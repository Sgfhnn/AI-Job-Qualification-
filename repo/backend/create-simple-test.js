// Simple test without database - just test AI functionality
process.env.GEMINI_API_KEY = 'AIzaSyBjiPfXpQaDff1Teq9pUPiB7hyL-wjuPW0'

const express = require('express')
const cors = require('cors')
const geminiService = require('./services/gemini')

const app = express()
const PORT = 3001

app.use(cors())
app.use(express.json())

// Simple job creation endpoint without database
app.post('/api/jobs/create', async (req, res) => {
  try {
    const { jobTitle, requirements } = req.body

    if (!jobTitle || !requirements) {
      return res.status(400).json({
        success: false,
        error: 'Job title and requirements are required'
      })
    }

    console.log('Creating job:', jobTitle)
    
    // Generate form fields using AI
    const formFields = await geminiService.generateFormFields(jobTitle, requirements)
    console.log('Generated form fields:', formFields.length, 'fields')

    // Return success without database
    res.json({
      success: true,
      jobId: 'test-job-123',
      formFields: formFields,
      message: 'Job created successfully (test mode - no database)'
    })
  } catch (error) {
    console.error('Error creating job:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// Test candidate analysis endpoint
app.post('/api/test/analyze', async (req, res) => {
  try {
    const { jobRequirements, resumeText, formData } = req.body
    
    const analysis = await geminiService.analyzeCandidate(
      jobRequirements || 'Software developer with React experience',
      resumeText || 'Experienced React developer with 3 years experience',
      formData || { name: 'Test User', skills: 'React, JavaScript' }
    )
    
    res.json({
      success: true,
      analysis: analysis
    })
  } catch (error) {
    console.error('Error analyzing candidate:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

// Serve the test interface
app.get('/', (req, res) => {
  res.sendFile(__dirname + '/test-frontend.html')
})

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Simple AI test server running' })
})

app.listen(PORT, () => {
  console.log(`Simple test server running on port ${PORT}`)
  console.log(`Health check: http://localhost:${PORT}/health`)
  console.log(`Test job creation: POST http://localhost:${PORT}/api/jobs/create`)
  console.log(`Test analysis: POST http://localhost:${PORT}/api/test/analyze`)
})
