const axios = require('axios')

const BACKEND_URL = 'https://ai-job-qualification.onrender.com'

async function testProduction() {
  console.log('🧪 Testing Production Deployment...\n')
  
  try {
    // Test 1: Create Job
    console.log('1️⃣ Testing Job Creation with AI Form Generation...')
    const jobResponse = await axios.post(`${BACKEND_URL}/api/jobs/create`, {
      jobTitle: 'Full Stack Developer',
      requirements: '3+ years experience with React, Node.js, and MongoDB'
    })
    
    console.log('✅ Job Created!')
    console.log('Job ID:', jobResponse.data.jobId)
    console.log('Form Fields Count:', jobResponse.data.formFields?.length || 0)
    console.log('First 3 fields:', jobResponse.data.formFields?.slice(0, 3).map(f => f.label))
    
    const jobId = jobResponse.data.jobId
    
    // Test 2: Submit Application
    console.log('\n2️⃣ Testing Application Submission with AI Analysis...')
    const appResponse = await axios.post(`${BACKEND_URL}/api/applications/submit`, {
      jobId: jobId,
      formData: JSON.stringify({
        name: 'Jane Smith',
        email: 'jane@example.com',
        programmingLanguages: 'JavaScript, TypeScript, Python',
        frameworksUsed: 'React, Node.js, Express, MongoDB',
        yearsOfCoding: '4 years',
        projectPortfolio: 'Built e-commerce platform, Created REST APIs'
      })
    })
    
    console.log('✅ Application Submitted!')
    console.log('\n🤖 AI Analysis Results:')
    console.log('Score:', appResponse.data.analysis.score + '%')
    console.log('Explanation:', appResponse.data.analysis.explanation?.substring(0, 150) + '...')
    console.log('Strengths:', appResponse.data.analysis.strengths?.length || 0, 'items')
    console.log('Concerns:', appResponse.data.analysis.concerns?.length || 0, 'items')
    console.log('Recommendation:', appResponse.data.analysis.recommendation?.substring(0, 100) + '...')
    
    console.log('\n✅ ALL TESTS PASSED! Production is working! 🎉')
    
  } catch (error) {
    console.error('\n❌ TEST FAILED!')
    console.error('Error:', error.message)
    if (error.response) {
      console.error('Status:', error.response.status)
      console.error('Response:', JSON.stringify(error.response.data, null, 2))
    }
  }
}

testProduction()
