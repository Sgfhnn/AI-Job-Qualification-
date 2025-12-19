const { GoogleGenerativeAI } = require('@google/generative-ai')

class GeminiService {
  constructor() {
    this.version = '1.2.1-sdk'
    this.apiKey = process.env.GEMINI_API_KEY

    if (!this.apiKey) {
      console.error(`[Gemini v${this.version}] API Key missing!`)
    } else {
      console.log(`[Gemini v${this.version}] Service initialized with key: ${this.apiKey.substring(0, 10)}...`)
    }

    this.genAI = new GoogleGenerativeAI(this.apiKey)
    // Use gemini-2.5-flash as requested, fallback to 1.5-flash if needed
    this.modelName = 'gemini-2.5-flash'
  }

  async generateFormFields(jobTitle, requirements) {
    console.log(`[Gemini v${this.version}] Generating form fields for: ${jobTitle}`)

    const prompt = `Create 6-8 dynamic fields for: ${jobTitle}

Requirements: ${requirements}

Return JSON array starting with name and email, then add 4-6 job-specific fields:
[{"name":"name","type":"text","label":"Full Name","required":true},{"name":"email","type":"email","label":"Email","required":true}]

Use types: text, email, number, select, textarea
Make fields highly relevant to the job. Keep labels concise. 
IMPORTANT: For "select" fields, "options" MUST be an array of strings, NOT objects. Max 3 options.`

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 2048,
        }
      })

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      console.log(`[Gemini v${this.version}] Received response length: ${text.length}`)

      const parsed = this.extractJson(text, '[')
      if (parsed) {
        console.log(`[Gemini v${this.version}] Successfully generated ${parsed.length} fields`)
        return parsed
      }

      throw new Error('Could not parse JSON from Gemini response')
    } catch (error) {
      console.error(`[Gemini v${this.version}] Form Generation Error:`, error.message)
      return this.generateJobSpecificFallback(jobTitle, requirements)
    }
  }

  async analyzeCandidate(jobRequirements, resumeText, formData) {
    console.log(`[Gemini v${this.version}] Analyzing candidate...`)

    const prompt = `Analyze this candidate for the job.

Job: ${jobRequirements}
Resume: ${resumeText || 'Not provided'}
Data: ${JSON.stringify(formData)}

Return ONLY JSON:
{
  "score": 85,
  "explanation": "Detailed analysis mentioning specific skills",
  "strengths": ["strength 1", "strength 2", "strength 3"],
  "concerns": ["concern 1", "concern 2"],
  "recommendation": "hire/consider/reject with reasoning"
}`

    try {
      const model = this.genAI.getGenerativeModel({
        model: this.modelName,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 2048,
        }
      })

      const result = await model.generateContent(prompt)
      const response = await result.response
      const text = response.text()

      console.log(`[Gemini v${this.version}] Received analysis length: ${text.length}`)

      const parsed = this.extractJson(text, '{')
      if (parsed) {
        console.log(`[Gemini v${this.version}] Analysis complete. Score: ${parsed.score}`)
        return parsed
      }

      console.error(`[Gemini v${this.version}] Failed to extract JSON from: "${text.substring(0, 1000)}"`)
      throw new Error('Could not parse JSON from analysis response')
    } catch (error) {
      console.error(`[Gemini v${this.version}] Analysis Error:`, error.message)
      return this.generateFallbackAnalysis(formData, resumeText)
    }
  }

  extractJson(text, startChar) {
    const endChar = startChar === '[' ? ']' : '}'
    const startIdx = text.indexOf(startChar)
    const endIdx = text.lastIndexOf(endChar)

    console.log(`[Gemini v${this.version}] extractJson: searching for ${startChar}...${endChar}. Found at indices: ${startIdx}, ${endIdx}`)

    if (startIdx !== -1 && endIdx !== -1 && endIdx > startIdx) {
      const jsonStr = text.substring(startIdx, endIdx + 1)
      try {
        return JSON.parse(jsonStr)
      } catch (e) {
        console.error(`[Gemini v${this.version}] JSON Parse Error:`, e.message)
        console.error(`[Gemini v${this.version}] Problematic JSON string:`, jsonStr)
        return null
      }
    }
    return null
  }

  generateFallbackAnalysis(formData, resumeText) {
    console.log(`[Gemini v${this.version}] Using intelligent fallback analysis`)
    const candidateName = formData.name || 'Candidate'
    const formFields = Object.keys(formData)
    const completedFields = formFields.filter(key => formData[key] && formData[key] !== '').length
    const completionRate = completedFields / formFields.length

    let baseScore = Math.floor(completionRate * 40) + 30
    if (resumeText && resumeText.length > 100) baseScore += 15
    if (formData.skills || formData.experience) baseScore += 10
    const finalScore = Math.min(95, baseScore + Math.floor(Math.random() * 10))

    return {
      score: finalScore,
      explanation: `${candidateName} scored ${finalScore}% based on application completeness. (Note: AI service was temporarily unavailable, using local evaluation).`,
      strengths: ['Completed application thoroughly', 'Shows interest in the position'],
      concerns: ['AI analysis temporarily unavailable - manual review recommended'],
      recommendation: finalScore >= 75 ? 'Recommend for interview' : 'Consider for initial screening'
    }
  }

  generateJobSpecificFallback(jobTitle, requirements) {
    const baseFields = [
      { "name": "name", "type": "text", "label": "Full Name", "required": true },
      { "name": "email", "type": "email", "label": "Email Address", "required": true }
    ]

    return baseFields.concat([
      { "name": "yearsExperience", "type": "select", "label": "Years of Experience", "required": true, "options": ["0-1", "1-3", "3-5", "5+"] },
      { "name": "skills", "type": "textarea", "label": "Key Skills", "required": true },
      { "name": "availability", "type": "text", "label": "Availability", "required": true }
    ])
  }
}

module.exports = new GeminiService()
