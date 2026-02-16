const geminiService = require('./gemini');

class InterviewService {
    constructor() {
        this.sessions = {}; // In-memory session tracking for now
    }

    /**
     * Start a new interview session
     * @param {string} applicationId
     * @param {object} applicationData - Application context
     * @returns {Promise<string>} - Initial greeting
     */
    async startInterview(applicationId, applicationData) {
        console.log(`🎤 Starting interview for application: ${applicationId}`);

        const context = `
        You are an AI interviewer for the job "${applicationData.jobTitle}".
        You are interviewing ${applicationData.candidateName}.
        
        Candidate Summary: ${applicationData.summary}
        Strengths: ${applicationData.strengths.join(', ')}
        Concerns: ${applicationData.concerns.join(', ')}
        
        Your goal is to conduct a short, 3-5 minute professional interview.
        Ask about their experience, specific skills related to the job, and address the concerns listed above.
        Be polite, professional, but dig deeper into their technical knowledge.
        
        Start by introducing yourself as the AI Recruiter and asking a welcoming opening question.
        Keep your responses concise (under 2-3 sentences) so the conversation flows naturally.
        `;

        this.sessions[applicationId] = {
            context: context,
            history: [],
            startTime: Date.now()
        };

        // SAVE QUOTA: Hardcode the initial greeting instead of calling Gemini
        const greetings = [
            `Hello ${applicationData.candidateName}! I'm your AI Recruiter. Thank you for joining this interview for the ${applicationData.jobTitle} position. To start off, could you tell me a bit about your professional background and what interests you about this role?`,
            `Welcome, ${applicationData.candidateName}. I'll be conducting your initial screening for the ${applicationData.jobTitle} role today. Can we begin by having you walk me through your most relevant experience for this position?`,
            `Hi ${applicationData.candidateName}, it's great to meet you virtually! I'm an AI assistant helping to screen candidates for our ${applicationData.jobTitle} opening. Could you please introduce yourself and highlight a few key skills you'd bring to the team?`
        ];

        const initialGreeting = greetings[Math.floor(Math.random() * greetings.length)];

        this.sessions[applicationId].history.push({ role: 'assistant', content: initialGreeting });

        return initialGreeting;
    }

    /**
     * Process candidate response and generate next question
     * @param {string} applicationId
     * @param {string} candidateResponse
     * @returns {Promise<string>} - AI response/question
     */
    async processResponse(applicationId, candidateResponse) {
        if (!this.sessions[applicationId]) {
            console.log(`[Interview] Session missing for ${applicationId}, attempting bootstrap...`);
            // We'll need the application data to restore context
            // But interview.js doesn't have direct access to supabase usually, 
            // server.js should handle the re-fetch or we pass it in.
            // Let's modify the service to accept optional applicationContext
            throw new Error('Interview session expired. Please refresh the page to continue.');
        }

        const session = this.sessions[applicationId];
        session.history.push({ role: 'user', content: candidateResponse });

        // Generate AI response
        const aiResponse = await geminiService.generateInterviewResponse(session.context, session.history);

        session.history.push({ role: 'assistant', content: aiResponse });

        return aiResponse;
    }

    /**
     * Get interview transcript
     * @param {string} applicationId
     * @returns {array} - Chat history
     */
    getTranscript(applicationId) {
        return this.sessions[applicationId]?.history || [];
    }

    /**
     * End interview and generate summary
     */
    async endInterview(applicationId) {
        if (!this.sessions[applicationId]) return null;

        const session = this.sessions[applicationId];
        const transcript = session.history.map(m => `${m.role}: ${m.content}`).join('\n');

        // Generate final assessment
        const assessment = await geminiService.analyzeInterview(transcript);

        // Cleanup
        delete this.sessions[applicationId];

        return {
            transcript: session.history,
            assessment
        };
    }
}

module.exports = new InterviewService();
