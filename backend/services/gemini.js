const { GoogleGenerativeAI } = require('@google/generative-ai')

class GeminiService {
    constructor() {
        this.version = '1.2.5-sdk'
        this.apiKey = process.env.GEMINI_API_KEY

        if (!this.apiKey) {
            console.error(`[Gemini v${this.version}] API Key missing!`)
        } else {
            console.log(`[Gemini v${this.version}] Service initialized.`)
        }

        this.genAI = new GoogleGenerativeAI(this.apiKey)
        // Using gemini-2.5-flash as requested, despite low quota
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

IMPORTANT: Return ONLY the JSON array. Ensure the JSON is valid and properly terminated.
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

            // Clean JSON string
            const cleanJson = text.substring(text.indexOf('['), text.lastIndexOf(']') + 1)
            const parsed = JSON.parse(cleanJson)

            console.log(`[Gemini v${this.version}] Successfully generated ${parsed.length} fields`)
            return parsed
        } catch (error) {
            console.error(`[Gemini v${this.version}] Form Generation Error:`, error.message)
            return this.generateJobSpecificFallback(jobTitle, requirements)
        }
    }

    async analyzeCandidate(jobRequirements, resumeText, formData) {
        console.log(`[Gemini v${this.version}] Analyzing candidate...`)

        const prompt = `Analyze this candidate for the following job position.
CRITICAL: Your primary goal is to determine if the candidate's actual work experience and skills (from their resume) match the specific technical and professional requirements of the job.

JOB REQUIREMENTS:
${jobRequirements}

EXTRACTED RESUME TEXT:
${resumeText && resumeText.length > 50 ? resumeText : 'NO RESUME CONTENT EXTRACTED - Use form data only if resume is missing.'}

CANDIDATE FORM RESPONSES:
${JSON.stringify(formData)}

INSTRUCTIONS:
1. Carefully compare the EXTRACTED RESUME TEXT against the JOB REQUIREMENTS. 
2. If text was successfully extracted from the resume, it MUST be your primary source of truth.
3. Use the CANDIDATE FORM RESPONSES as supplementary information.
4. If the resume content is missing or couldn't be extracted, base your decision on the form data, but note this in the concerns if the job requires a resume.
5. Provide a realistic match score (0-100). Higher scores should only be given to candidates with clear, documented experience matching the job.

Return a JSON object with:
{
  "score": number,
  "explanation": "string (concise summary of match quality)",
  "strengths": ["string", "string", "string"],
  "concerns": ["string", "string"],
  "recommendation": "string (Detailed recommendation: Hire / Consider / Reject)"
}

IMPORTANT: Return ONLY the JSON object. Do not include markdown or extra text.`

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

            console.log(`[Gemini v${this.version}] Received analysis text length: ${text.length}`)

            // Extract JSON object safely
            const startIdx = text.indexOf('{')
            const endIdx = text.lastIndexOf('}')
            if (startIdx === -1 || endIdx === -1) throw new Error("Could not find JSON object in AI response")

            const cleanJson = text.substring(startIdx, endIdx + 1)
            const parsed = JSON.parse(cleanJson)

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

    async generateInterviewResponse(context, history) {
        try {
            // Reconstruct the conversation as a single prompt for maximum reliability
            const chatHistory = history.map(h => `${h.role === 'user' ? 'Candidate' : 'Interviewer'}: ${h.content}`).join('\n');

            const fullPrompt = `
SYSTEM INSTRUCTIONS:
${context}

You are the AI Interviewer. Your goal is to conduct a professional, engaging, and focused interview.
Keep your responses concise (1-3 sentences) to make them suitable for text-to-speech.
Ask one follow-up question or transition to the next topic naturally.
Respond ONLY as the Interviewer.

CONVERSATION HISTORY:
${chatHistory}

Interviewer Response:`;

            const model = this.genAI.getGenerativeModel({ model: this.modelName });
            const result = await model.generateContent(fullPrompt);
            return result.response.text().trim();

        } catch (error) {
            console.error('Interview Chat Error:', error);

            // Check for quota exceeded error (429)
            if (error.status === 429 || (error.message && error.message.includes('429'))) {
                return "I apologize, but we've hit our AI processing limit for the moment. Please wait about a minute before trying again, or contact support if the issue persists.";
            }

            // Return a safe conversational fallback
            return "I apologize, I'm having a slight technical glitch. Could you please reiterate your last point or tell me more about your experience?";
        }
    }

    async analyzeInterview(transcript) {
        const prompt = `Analyze this job interview transcript.
        
        TRANSCRIPT:
        ${transcript}
        
        Provide a JSON summary with:
        - technical_score: number (0-100)
        - communication_score: number (0-100)
        - final_recommendation: text (Hire / Reject / Discuss)
        - key_observations: string array
        `;

        try {
            const result = await this.genAI.getGenerativeModel({
                model: this.modelName,
                generationConfig: { responseMimeType: "application/json" }
            }).generateContent(prompt);
            return JSON.parse(result.response.text());
        } catch (e) {
            console.error("AI Analysis failed:", e);
            return { technical_score: 50, communication_score: 50, final_recommendation: "Review Needed", key_observations: ["Analysis failed or interrupted"] };
        }
    }

    async extractJobDetails(documentText) {
        console.log(`[Gemini v${this.version}] Extracting job details from document...`)

        const prompt = `Extract the Job Title and Job Requirements from the following text.
        
        DOCUMENT TEXT:
        ${documentText.substring(0, 10000)}
        
        Return a JSON object with:
        {
          "jobTitle": "string",
          "requirements": "string (concise bullet points or detailed description)"
        }

        IMPORTANT: Return ONLY the JSON object. Ensure the JSON is valid and properly terminated.`

        try {
            const model = this.genAI.getGenerativeModel({
                model: this.modelName,
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 2048,
                    responseMimeType: "application/json",
                }
            })

            const result = await model.generateContent(prompt)
            const text = result.response.text()

            // Extract JSON object safely
            const startIdx = text.indexOf('{')
            const endIdx = text.lastIndexOf('}')
            const cleanJson = text.substring(startIdx, endIdx + 1)
            const parsed = JSON.parse(cleanJson)

            return {
                jobTitle: parsed.jobTitle || 'Extracted Job',
                requirements: parsed.requirements || 'Extracted requirements'
            }
        } catch (error) {
            console.error(`[Gemini v${this.version}] Job Extraction Error:`, error.message)
            return {
                jobTitle: 'Failed to extract',
                requirements: documentText.substring(0, 500) + '...'
            }
        }
    }
}

module.exports = new GeminiService()
