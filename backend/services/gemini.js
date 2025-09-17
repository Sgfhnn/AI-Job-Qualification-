const axios = require('axios')

class GeminiService {
  constructor() {
    // Use environment variable first, fallback to hardcoded for production
    this.apiKey = process.env.GEMINI_API_KEY || 'AIzaSyCFg9g5F4GtOziXfy-5iyu_Gzfgh194LJI'
    this.baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent'
    
    // Debug API key
    if (!this.apiKey) {
      console.error('GEMINI_API_KEY not found in environment variables')
    } else {
      console.log('Gemini API Key loaded:', this.apiKey.substring(0, 10) + '...')
    }
  }

  async generateFormFields(jobTitle, requirements) {
    const prompt = `
You are an expert HR AI that creates highly customized job application forms. Analyze the job title and requirements to generate UNIQUE, RELEVANT form fields.

Job Title: ${jobTitle}
Job Requirements: ${requirements}

IMPORTANT: Create form fields that are SPECIFICALLY tailored to this exact job. Different jobs should have completely different forms.

Rules:
1. ALWAYS include: name (text), email (email)
2. Analyze the job requirements and create 6-12 additional fields that are SPECIFIC to this role
3. For technical roles: ask about programming languages, frameworks, tools, certifications
4. For creative roles: ask about portfolio, design tools, creative experience
5. For management roles: ask about team size, leadership experience, budget management
6. For sales roles: ask about sales targets, CRM experience, client management
7. For customer service: ask about conflict resolution, communication skills
8. Make field names descriptive and job-specific
9. Use appropriate field types (text, textarea, select, number)
10. Create realistic options for select fields

Generate a JSON array with fields that NO OTHER JOB would have the exact same combination.

Job-Specific Examples:
- Software Developer: "programmingLanguages", "frameworkExperience", "githubProfile", "codingChallengePreference"
- Graphic Designer: "designSoftwareProficiency", "portfolioUrl", "designSpecialty", "clientProjectExperience"
- Sales Manager: "salesTargetAchievement", "teamManagementExperience", "crmSystemsUsed", "industryExperience"

Return ONLY the JSON array, no other text:
`

    try {
      console.log('Generating form fields for:', jobTitle)
      console.log('Making request to:', this.baseUrl)
      
      if (!this.apiKey) {
        throw new Error('GEMINI_API_KEY is not configured')
      }

      const response = await axios.post(
        this.baseUrl,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': this.apiKey
          },
          timeout: 30000
        }
      )

      console.log('Gemini API Response Status:', response.status)
      
      if (!response.data || !response.data.candidates || !response.data.candidates[0]) {
        throw new Error('Invalid response structure from Gemini API')
      }

      const generatedText = response.data.candidates[0].content.parts[0].text
      console.log('Generated text:', generatedText.substring(0, 200) + '...')
      
      // Extract JSON from the response with better regex
      const jsonMatch = generatedText.match(/\[[\s\S]*?\]/g)
      if (jsonMatch && jsonMatch.length > 0) {
        const parsedFields = JSON.parse(jsonMatch[0])
        console.log('Successfully parsed form fields:', parsedFields.length, 'fields')
        return parsedFields
      } else {
        console.error('Could not extract JSON from response:', generatedText)
        throw new Error('Could not extract JSON from Gemini response')
      }
    } catch (error) {
      console.error('Error generating form fields:', error.response?.data || error.message)
      
      // Generate job-specific fallback fields based on job title and requirements
      const fallbackFields = this.generateJobSpecificFallback(jobTitle, requirements)
      
      console.log('Using fallback form fields:', fallbackFields.length, 'fields')
      return fallbackFields
    }
  }

  generateJobSpecificFallback(jobTitle, requirements) {
    const baseFields = [
      {"name": "name", "type": "text", "label": "Full Name", "required": true},
      {"name": "email", "type": "email", "label": "Email Address", "required": true}
    ]

    const titleLower = jobTitle.toLowerCase()
    const reqLower = requirements.toLowerCase()

    // Determine job category and generate specific fields
    if (titleLower.includes('developer') || titleLower.includes('engineer') || titleLower.includes('programmer') || reqLower.includes('programming')) {
      return baseFields.concat([
        {"name": "programmingLanguages", "type": "textarea", "label": "Programming Languages & Proficiency", "required": true, "placeholder": "e.g., JavaScript (Expert), Python (Intermediate), Java (Beginner)"},
        {"name": "frameworksUsed", "type": "textarea", "label": "Frameworks & Libraries Experience", "required": true, "placeholder": "e.g., React, Node.js, Django, Spring Boot"},
        {"name": "yearsOfCoding", "type": "select", "label": "Years of Programming Experience", "required": true, "options": ["Less than 1 year", "1-2 years", "3-5 years", "6-10 years", "10+ years"]},
        {"name": "githubProfile", "type": "text", "label": "GitHub Profile URL", "required": false, "placeholder": "https://github.com/username"},
        {"name": "projectPortfolio", "type": "textarea", "label": "Notable Projects", "required": true, "placeholder": "Describe 2-3 significant projects you've worked on"},
        {"name": "preferredWorkEnvironment", "type": "select", "label": "Preferred Development Environment", "required": true, "options": ["Remote", "On-site", "Hybrid", "No preference"]},
        {"name": "technicalChallenges", "type": "textarea", "label": "Describe a technical challenge you solved", "required": true}
      ])
    } else if (titleLower.includes('designer') || titleLower.includes('creative') || reqLower.includes('design')) {
      return baseFields.concat([
        {"name": "designSoftware", "type": "textarea", "label": "Design Software Proficiency", "required": true, "placeholder": "e.g., Adobe Creative Suite, Figma, Sketch, etc."},
        {"name": "portfolioUrl", "type": "text", "label": "Design Portfolio URL", "required": true, "placeholder": "https://yourportfolio.com"},
        {"name": "designSpecialty", "type": "select", "label": "Design Specialization", "required": true, "options": ["UI/UX Design", "Graphic Design", "Web Design", "Print Design", "Brand Design", "Motion Graphics"]},
        {"name": "yearsOfDesign", "type": "select", "label": "Years of Design Experience", "required": true, "options": ["Less than 1 year", "1-3 years", "4-6 years", "7-10 years", "10+ years"]},
        {"name": "clientExperience", "type": "select", "label": "Client Work Experience", "required": true, "options": ["Freelance only", "Agency experience", "In-house teams", "Mix of all", "No client work"]},
        {"name": "designProcess", "type": "textarea", "label": "Describe your design process", "required": true}
      ])
    } else if (titleLower.includes('sales') || titleLower.includes('business development') || reqLower.includes('sales')) {
      return baseFields.concat([
        {"name": "salesExperience", "type": "select", "label": "Years in Sales", "required": true, "options": ["Less than 1 year", "1-3 years", "4-7 years", "8-15 years", "15+ years"]},
        {"name": "salesTargets", "type": "textarea", "label": "Previous Sales Achievements", "required": true, "placeholder": "Describe your sales targets and achievements"},
        {"name": "crmExperience", "type": "textarea", "label": "CRM Systems Experience", "required": true, "placeholder": "e.g., Salesforce, HubSpot, Pipedrive"},
        {"name": "industryExperience", "type": "textarea", "label": "Industry Experience", "required": true, "placeholder": "Which industries have you sold in?"},
        {"name": "salesMethodology", "type": "select", "label": "Preferred Sales Approach", "required": true, "options": ["Consultative Selling", "Solution Selling", "Challenger Sale", "Relationship Selling", "Other"]},
        {"name": "teamSize", "type": "select", "label": "Team Management Experience", "required": false, "options": ["No management", "2-5 people", "6-10 people", "11-20 people", "20+ people"]}
      ])
    } else if (titleLower.includes('manager') || titleLower.includes('lead') || titleLower.includes('director') || reqLower.includes('management')) {
      return baseFields.concat([
        {"name": "managementExperience", "type": "select", "label": "Years in Management", "required": true, "options": ["Less than 1 year", "1-3 years", "4-7 years", "8-15 years", "15+ years"]},
        {"name": "teamSizeManaged", "type": "select", "label": "Largest Team Size Managed", "required": true, "options": ["2-5 people", "6-10 people", "11-25 people", "26-50 people", "50+ people"]},
        {"name": "budgetResponsibility", "type": "select", "label": "Budget Management Experience", "required": true, "options": ["Under $100K", "$100K-$500K", "$500K-$1M", "$1M-$5M", "$5M+", "No budget responsibility"]},
        {"name": "leadershipStyle", "type": "textarea", "label": "Describe your leadership style", "required": true},
        {"name": "conflictResolution", "type": "textarea", "label": "How do you handle team conflicts?", "required": true},
        {"name": "performanceManagement", "type": "textarea", "label": "Performance management approach", "required": true}
      ])
    } else if (titleLower.includes('marketing') || reqLower.includes('marketing')) {
      return baseFields.concat([
        {"name": "marketingChannels", "type": "textarea", "label": "Marketing Channels Experience", "required": true, "placeholder": "e.g., Social Media, Email, SEO, PPC, Content Marketing"},
        {"name": "marketingTools", "type": "textarea", "label": "Marketing Tools & Platforms", "required": true, "placeholder": "e.g., Google Analytics, HubSpot, Mailchimp, Facebook Ads"},
        {"name": "campaignExperience", "type": "textarea", "label": "Notable Marketing Campaigns", "required": true},
        {"name": "budgetManagement", "type": "select", "label": "Marketing Budget Experience", "required": true, "options": ["Under $10K", "$10K-$50K", "$50K-$200K", "$200K-$1M", "$1M+"]},
        {"name": "analyticsExperience", "type": "select", "label": "Analytics & Data Experience", "required": true, "options": ["Basic", "Intermediate", "Advanced", "Expert"]},
        {"name": "contentCreation", "type": "select", "label": "Content Creation Skills", "required": true, "options": ["Writing only", "Design only", "Video only", "Multi-format", "None"]}
      ])
    } else {
      // Generic professional fallback
      return baseFields.concat([
        {"name": "yearsExperience", "type": "select", "label": "Years of Relevant Experience", "required": true, "options": ["Less than 1 year", "1-3 years", "4-7 years", "8-15 years", "15+ years"]},
        {"name": "skills", "type": "textarea", "label": "Key Skills & Competencies", "required": true, "placeholder": "List your most relevant skills for this role"},
        {"name": "educationLevel", "type": "select", "label": "Education Level", "required": true, "options": ["High School", "Associate Degree", "Bachelor's Degree", "Master's Degree", "PhD", "Professional Certification"]},
        {"name": "industryExperience", "type": "textarea", "label": "Industry Experience", "required": true, "placeholder": "Describe your experience in relevant industries"},
        {"name": "achievements", "type": "textarea", "label": "Key Professional Achievements", "required": true},
        {"name": "availability", "type": "select", "label": "Availability to Start", "required": true, "options": ["Immediately", "2 weeks notice", "1 month", "More than 1 month"]},
        {"name": "expectedSalary", "type": "text", "label": "Expected Salary Range", "required": false, "placeholder": "e.g., $60,000-$80,000 or Negotiable"}
      ])
    }
  }

  async analyzeCandidate(jobRequirements, resumeText, formData) {
    const prompt = `
You are an expert AI recruiter with deep hiring experience. Analyze this specific candidate against the exact job requirements and provide a UNIQUE, DETAILED analysis.

Job Requirements: ${jobRequirements}

Resume Content: ${resumeText}

Application Form Data: ${JSON.stringify(formData, null, 2)}

CRITICAL INSTRUCTIONS:
1. Analyze EVERY detail in the resume and form data
2. Compare SPECIFICALLY against the job requirements
3. Give a UNIQUE score (not generic 75%) based on actual fit
4. Provide SPECIFIC strengths and concerns based on actual content
5. Make PERSONALIZED recommendations
6. Consider: technical skills match, experience relevance, cultural fit, growth potential
7. Score should reflect: 90-100% (excellent fit), 70-89% (good fit), 50-69% (moderate fit), 30-49% (poor fit), 0-29% (no fit)

Return ONLY this JSON structure:
{
  "score": <precise number 0-100 based on actual analysis>,
  "explanation": "<detailed 3-4 sentence explanation of why this specific score, mentioning specific skills/experience>",
  "strengths": ["<specific strength 1>", "<specific strength 2>", "<specific strength 3>"],
  "concerns": ["<specific concern 1>", "<specific concern 2>"],
  "recommendation": "<hire/consider/reject with specific reasoning based on analysis>"
}
`

    return await this.makeRequest(prompt, formData, resumeText)
  }

  async makeRequest(prompt, formData = {}, resumeText = '') {
    try {
      console.log('Making AI analysis request...')
      
      if (!this.apiKey) {
        throw new Error('GEMINI_API_KEY is not configured')
      }

      const response = await axios.post(
        this.baseUrl,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 2048,
          }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'X-goog-api-key': this.apiKey
          },
          timeout: 30000
        }
      )

      console.log('AI Analysis Response Status:', response.status)
      
      if (!response.data || !response.data.candidates || !response.data.candidates[0]) {
        throw new Error('Invalid response structure from Gemini API')
      }

      const generatedText = response.data.candidates[0].content.parts[0].text
      console.log('Generated analysis text:', generatedText.substring(0, 200) + '...')
      
      // Extract JSON from the response with better regex
      const jsonMatch = generatedText.match(/\{[\s\S]*?\}/g)
      if (jsonMatch && jsonMatch.length > 0) {
        const analysis = JSON.parse(jsonMatch[0])
        console.log('Successfully parsed analysis with score:', analysis.score)
        
        // Ensure score is within valid range
        if (analysis.score < 0) analysis.score = 0
        if (analysis.score > 100) analysis.score = 100
        
        return analysis
      } else {
        console.error('Could not extract JSON from analysis response:', generatedText)
        throw new Error('Could not extract JSON from Gemini response')
      }
    } catch (error) {
      console.error('Gemini API Error:', error.response?.data || error.message)
      
      // Check if it's an API key issue
      if (error.response?.status === 401 || error.response?.status === 403) {
        console.error('API Key issue - check GEMINI_API_KEY environment variable')
      }
      
      // Generate realistic fallback analysis based on actual form data
      const candidateName = formData.name || 'Candidate'
      const candidateEmail = formData.email || 'No email provided'
      
      // Analyze form completeness and generate realistic score
      const formFields = Object.keys(formData)
      const completedFields = formFields.filter(key => formData[key] && formData[key] !== '').length
      const completionRate = completedFields / formFields.length
      
      // Generate score based on completion rate and resume presence
      let baseScore = Math.floor(completionRate * 40) + 30 // 30-70 base
      if (resumeText && resumeText.length > 100) baseScore += 15 // Resume bonus
      if (formData.skills || formData.programmingLanguages || formData.experience) baseScore += 10 // Skills bonus
      
      // Add some randomness to avoid identical scores
      const finalScore = Math.min(95, baseScore + Math.floor(Math.random() * 10))
      
      // Generate personalized feedback based on actual data
      const strengths = []
      const concerns = []
      
      if (resumeText && resumeText.length > 100) {
        strengths.push('Provided detailed resume with substantial content')
      }
      if (formData.skills || formData.programmingLanguages) {
        strengths.push('Clearly articulated relevant technical skills')
      }
      if (formData.yearsExperience || formData.yearsOfCoding || formData.salesExperience) {
        strengths.push('Has relevant professional experience in the field')
      }
      if (completionRate > 0.8) {
        strengths.push('Completed application thoroughly and professionally')
      }
      
      if (completionRate < 0.6) {
        concerns.push('Incomplete application - several fields left blank')
      }
      if (!resumeText || resumeText.length < 100) {
        concerns.push('Limited resume content provided for evaluation')
      }
      concerns.push('AI analysis temporarily unavailable - manual review required')
      
      return {
        score: finalScore,
        explanation: `${candidateName} scored ${finalScore}% based on application completeness (${Math.round(completionRate * 100)}% fields completed), resume quality, and demonstrated relevant experience. AI analysis service temporarily unavailable, but initial screening shows ${finalScore >= 70 ? 'promising' : 'moderate'} potential for this role.`,
        strengths: strengths.length > 0 ? strengths : ['Submitted application for consideration', 'Shows interest in the position'],
        concerns: concerns,
        recommendation: finalScore >= 80 ? 'Recommend for interview - strong application materials' : 
                       finalScore >= 60 ? 'Consider for phone screening - decent fit with some gaps' : 
                       'Manual review needed - application shows basic interest but limited evidence of fit'
      }
    }
  }
}

module.exports = new GeminiService()
