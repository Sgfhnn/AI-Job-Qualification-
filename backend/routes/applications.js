const express = require('express')
const router = express.Router()
const multer = require('multer')
const path = require('path')
const fs = require('fs')
const supabase = require('../config/supabase')
const geminiService = require('../services/gemini')
const pdfParse = require('pdf-parse')
const mammoth = require('mammoth')
const textract = require('textract')
const { v4: uuidv4 } = require('uuid')

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads')
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true })
    }
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname))
  }
})

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /pdf|doc|docx/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype) || 
                    file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
                    file.mimetype === 'application/msword'
    
    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed'))
    }
  }
})

// Extract text from resume with enhanced parsing
async function extractResumeText(resumeFile) {
  let resumeText = ''
  
  if (resumeFile) {
    try {
      const fileBuffer = fs.readFileSync(resumeFile.path)
      const fileExtension = path.extname(resumeFile.originalname).toLowerCase()
      
      if (fileExtension === '.pdf') {
        try {
          const pdfData = await pdfParse(fileBuffer)
          resumeText = pdfData.text.trim()
          
          // Validate PDF extraction quality
          if (!resumeText || resumeText.length < 50) {
            throw new Error('PDF text extraction failed or insufficient content')
          }
        } catch (pdfError) {
          console.error('PDF parsing error:', pdfError)
          resumeText = `[PDF file uploaded: ${resumeFile.originalname}. Text extraction failed - manual review required.]`
        }
      } else if (fileExtension === '.docx') {
        try {
          const result = await mammoth.extractRawText({ buffer: fileBuffer })
          resumeText = result.value.trim()
          
          // Validate DOCX extraction
          if (!resumeText || resumeText.length < 50) {
            throw new Error('DOCX text extraction failed or insufficient content')
          }
          
          // Clean up common DOCX artifacts
          resumeText = resumeText
            .replace(/\n\s*\n/g, '\n\n') // Clean up excessive line breaks
            .replace(/\t+/g, ' ') // Replace tabs with spaces
            .replace(/\s{3,}/g, '  ') // Reduce multiple spaces
        } catch (docxError) {
          console.error('DOCX parsing error:', docxError)
          resumeText = `[DOCX file uploaded: ${resumeFile.originalname}. Text extraction failed - manual review required.]`
        }
      } else if (fileExtension === '.doc') {
        // Use textract for legacy DOC files
        try {
          await new Promise((resolve, reject) => {
            textract.fromBufferWithMime('application/msword', fileBuffer, (error, text) => {
              if (error) {
                reject(error)
              } else {
                resumeText = text.trim()
                
                // Clean up DOC text
                resumeText = resumeText
                  .replace(/\n\s*\n/g, '\n\n')
                  .replace(/\t+/g, ' ')
                  .replace(/\s{3,}/g, '  ')
                resolve()
              }
            })
          })
          
          if (!resumeText || resumeText.length < 50) {
            throw new Error('DOC text extraction failed or insufficient content')
          }
        } catch (docError) {
          console.error('DOC parsing error:', docError)
          resumeText = `[DOC file uploaded: ${resumeFile.originalname}. Text extraction failed - manual review required.]`
        }
      } else {
        resumeText = `[Unsupported file format: ${fileExtension}. Please upload PDF, DOC, or DOCX files.]`
      }
      
      // Final validation and preprocessing
      if (resumeText && !resumeText.startsWith('[') && resumeText.length >= 50) {
        // Add structure markers for better AI analysis
        resumeText = `RESUME CONTENT:\n${resumeText}\n\nEND OF RESUME`
      }
    } catch (error) {
      console.error('Error processing resume file:', error)
      resumeText = `[Error processing ${resumeFile.originalname}: ${error.message}. Manual review required.]`
    }
  }
  
  return resumeText
}

// Submit job application
router.post('/submit', upload.single('resume'), async (req, res) => {
  try {
    const { jobId, formData } = req.body
    const resumeFile = req.file

    if (!jobId || !formData) {
      return res.status(400).json({
        success: false,
        error: 'Job ID and form data are required'
      })
    }

    if (!resumeFile) {
      return res.status(400).json({
        success: false,
        error: 'Resume file is required'
      })
    }

    const parsedFormData = JSON.parse(formData)

    // Get job details
    const { data: jobData, error: jobError } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (jobError || !jobData) {
      return res.status(404).json({
        success: false,
        error: 'Job not found'
      })
    }

    // Extract resume text
    const resumeText = await extractResumeText(resumeFile)

    // Analyze candidate using AI
    console.log('Starting AI analysis for candidate:', parsedFormData.name)
    console.log('Resume text length:', resumeText.length)
    
    const analysis = await geminiService.analyzeCandidate(
      jobData.requirements,
      resumeText,
      parsedFormData
    )
    
    console.log('AI Analysis completed with score:', analysis.score)

    // Upload resume to Supabase Storage
    const resumeBuffer = fs.readFileSync(resumeFile.path)
    const resumeFileName = `resumes/${uuidv4()}-${resumeFile.originalname}`
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('resumes')
      .upload(resumeFileName, resumeBuffer, {
        contentType: resumeFile.mimetype
      })

    let resumeUrl = null
    if (!uploadError) {
      const { data: urlData } = supabase.storage
        .from('resumes')
        .getPublicUrl(resumeFileName)
      resumeUrl = urlData.publicUrl
    }

    // Save application to database
    const applicationId = uuidv4()
    const submittedAt = new Date().toISOString()
    const { data, error } = await supabase
      .from('applications')
      .insert({
        id: applicationId,
        job_id: jobId,
        name: parsedFormData.name,
        email: parsedFormData.email,
        form_data: parsedFormData,
        resume_file: resumeFile.filename, // Store local filename for serving
        resume_original_name: resumeFile.originalname, // Store original filename
        resume_url: resumeUrl, // Keep Supabase URL as backup
        score: analysis.score,
        explanation: analysis.explanation,
        submitted_at: submittedAt,
        created_at: submittedAt
      })
      .select()

    if (error) {
      console.error('Database error:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to save application'
      })
    }

    // Keep the file for local serving, don't delete it
    // The file is already saved in the uploads directory by multer
    console.log('Resume file saved locally:', resumeFile.filename)

    res.json({
      success: true,
      applicationId: applicationId,
      score: analysis.score
    })
  } catch (error) {
    console.error('Error submitting application:', error)
    
    // Clean up temporary file if it exists
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path)
    }
    
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

module.exports = router
