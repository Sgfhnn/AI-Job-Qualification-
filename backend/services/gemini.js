const { GoogleGenerativeAI } = require('@google/generative-ai')

class GeminiService {
    constructor() {
        this.version = '1.2.4-sdk'
        this.apiKey = process.env.GEMINI_API_KEY

        if (!this.apiKey) {
            console.error(`[Gemini v${this.version}] API Key missing!`)
        } else {
            console.log(`[Gemini v${this.version}] Service initialized.`)
        }

        this.genAI = new GoogleGenerativeAI(this.apiKey)
        // Using gemini-2.5-flash as requested
        this.modelName = 'gemini-2.5-flash'
    }

    async generateFormFields(jobTitle, requirements) {
        console.log(`[Gemini v${this.version}] Generating form fields for: ${jobTitle}`)

        const prompt = `Create 6-8 dynamic fields for a job application.
Job Title: ${jobTitle}
Requirements: ${requirements}

Return a JSON array of objects. Each object must have:
- name: string (camelCase)
- type: string (text, email, number, select, textarea)
- label: string (Human readable)
- required: boolean
- options: array of strings (ONLY for "select" type)

Example: [{"name":"yearsExp","type":"number","label":"Years of Experience","required":true}]`

        try {
            const model = this.genAI.getGenerativeModel({
                model: this.modelName,
                generationConfig: {
                    temperature: 0.4,
                    maxOutputTokens: 2048,
                    responseMimeType: "application/json",
                }
            })

            const result = await model.generateContent(prompt)
            const text = result.response.text()
            const parsed = JSON.parse(text)

            console.log(`[Gemini v${this.version}] Successfully generated ${parsed.length} fields`)
            return parsed
        } catch (error) {
            console.error(`[Gemini v${this.version}] Form Generation Error:`, error.message)
            return this.generateJobSpecificFallback(jobTitle, requirements)
        }
    }

    async analyzeCandidate(jobRequirements, resumeText, formData) {
        console.log(`[Gemini v${this.version}] Analyzing candidate...`)

        const prompt = `Analyze this candidate for the job.
Job Requirements: ${jobRequirements}
Resume Content: ${resumeText || 'Not provided'}
Form Data: ${JSON.stringify(formData)}

Return a JSON object with:
{
  "score": number (0-100),
  "explanation": "string (concise 2-3 sentence summary)",
  "strengths": ["string", "string", "string"],
  "concerns": ["string", "string"],
  "recommendation": "string (hire/consider/reject with reasoning)"
}`

        try {
            const model = this.genAI.getGenerativeModel({
                model: this.modelName,
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 1024,
                    responseMimeType: "application/json",
                }
            })

            const result = await model.generateContent(prompt)
            const text = result.response.text()

            console.log(`[Gemini v${this.version}] Received analysis: ${text.length} chars`)
            const parsed = JSON.parse(text)

            console.log(`[Gemini v${this.version}] Analysis complete. Score: ${parsed.score}`)
            return parsed
        } catch (error) {
            console.error(`[Gemini v${this.version}] Analysis Error:`, error.message)
            return this.generateFallbackAnalysis(formData, resumeText)
        }
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
