export default function DemoPage() {
  return (
    <div className="bg-white">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Platform Demo
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            See how AI Hire transforms your recruitment process in just a few simple steps
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <div className="space-y-12">
            {/* Step 1 */}
            <div className="flex items-start space-x-8">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  1
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Create Your Job Posting</h3>
                <p className="text-gray-600 mb-4">
                  Simply enter your job title and requirements. Our AI analyzes your needs and understands the specific skills, experience, and qualifications you're looking for.
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 font-medium">Example:</p>
                  <p className="text-sm text-gray-600 mt-1">
                    "Senior Software Engineer - 5+ years experience with React, Node.js, and cloud platforms. Bachelor's degree in Computer Science preferred."
                  </p>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start space-x-8">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  2
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Generates Custom Form</h3>
                <p className="text-gray-600 mb-4">
                  Our advanced AI creates a tailored application form with relevant fields based on your job requirements. No more generic forms - each one is perfectly matched to your role.
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 font-medium">Generated fields might include:</p>
                  <ul className="text-sm text-gray-600 mt-1 list-disc list-inside">
                    <li>Years of React experience</li>
                    <li>Cloud platform expertise</li>
                    <li>Portfolio/GitHub links</li>
                    <li>Salary expectations</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start space-x-8">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  3
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Share & Receive Applications</h3>
                <p className="text-gray-600 mb-4">
                  Get a shareable link to your custom application form. Candidates fill out the form and upload their resumes. Everything is stored securely and processed instantly.
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 font-medium">Features:</p>
                  <ul className="text-sm text-gray-600 mt-1 list-disc list-inside">
                    <li>Secure resume upload (PDF, DOC, DOCX)</li>
                    <li>Real-time application processing</li>
                    <li>Automatic data validation</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex items-start space-x-8">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  4
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">AI Analyzes & Ranks Candidates</h3>
                <p className="text-gray-600 mb-4">
                  Our AI reads each resume, analyzes the application data, and provides intelligent rankings with detailed explanations. Focus on the best candidates first.
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 font-medium">AI provides:</p>
                  <ul className="text-sm text-gray-600 mt-1 list-disc list-inside">
                    <li>Match percentage (0-100%)</li>
                    <li>Detailed analysis of strengths</li>
                    <li>Areas where candidate may be lacking</li>
                    <li>Overall recommendation</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex items-start space-x-8">
              <div className="flex-shrink-0">
                <div className="w-12 h-12 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  5
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Review & Make Decisions</h3>
                <p className="text-gray-600 mb-4">
                  Use your comprehensive dashboard to review candidates, sort by AI scores, and make informed hiring decisions. All candidate data and analysis is at your fingertips.
                </p>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 font-medium">Dashboard features:</p>
                  <ul className="text-sm text-gray-600 mt-1 list-disc list-inside">
                    <li>Sortable candidate list</li>
                    <li>Direct resume access</li>
                    <li>AI analysis summaries</li>
                    <li>Application timestamps</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          <div className="text-center mt-16">
            <div className="bg-blue-50 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-4">Ready to Try It Yourself?</h2>
              <p className="text-gray-600 mb-6">
                Experience the power of AI-driven recruitment. Create your first job posting and see the magic happen.
              </p>
              <a href="/employer" className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors font-medium text-lg">
                Start Your Demo
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
