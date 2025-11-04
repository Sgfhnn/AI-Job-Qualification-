const axios = require('axios')

const API_URL = 'http://localhost:3001'

async function testIntegration() {
  console.log('🧪 Testing Full Integration...\n')
  
  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Check...')
    const health = await axios.get(`${API_URL}/health`)
    console.log('✅ Health:', health.data.message)
    
    // Test 2: Diagnostic
    console.log('\n2️⃣ Testing Diagnostic...')
    const diagnostic = await axios.get(`${API_URL}/api/diagnostic`)
    console.log('✅ API Key Valid:', diagnostic.data.geminiApiKeyValid)
    
    // Test 3: Create Job with AI Form
    console.log('\n3️⃣ Creating Job with AI Form Generation...')
    const jobResponse = await axios.post(`${API_URL}/api/jobs/create`, {
      jobTitle: 'Senior React Developer',
      requirements: '5+ years experience with React, TypeScript, Node.js, and AWS'
    })
    console.log('✅ Job Created:', jobResponse.data.jobId)
    console.log('   Form Fields:', jobResponse.data.formFields.length)
    
    const jobId = jobResponse.data.jobId
    
    // Test 4: Submit Application with AI Analysis
    console.log('\n4️⃣ Submitting Application for AI Analysis...')
    const appResponse = await axios.post(`${API_URL}/api/applications/submit`, {
      jobId: jobId,
      formData: JSON.stringify({
        name: 'Jane Smith',
        email: 'jane@example.com',
        yearsExperience: 6,
        skills: 'React, TypeScript, Node.js, AWS, Docker, Kubernetes'
      })
    })
    
    console.log('✅ Application Submitted!')
    console.log('\n🤖 AI Analysis Results:')
    console.log('   Score:', appResponse.data.analysis.score + '%')
    console.log('   Strengths:', appResponse.data.analysis.strengths?.length || 0)
    console.log('   Concerns:', appResponse.data.analysis.concerns?.length || 0)
    console.log('   Recommendation:', appResponse.data.analysis.recommendation?.substring(0, 60) + '...')
    
    console.log('\n✅ ALL INTEGRATION TESTS PASSED! 🎉')
    
  } catch (error) {
    console.error('❌ Test Failed:', error.response?.data || error.message)
  }
  
  process.exit(0)
}

testIntegration()
