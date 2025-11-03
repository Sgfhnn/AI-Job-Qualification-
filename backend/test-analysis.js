const axios = require('axios')

async function testAnalysis() {
  try {
    // First create a job
    console.log('1. Creating job...')
    const jobResponse = await axios.post('http://localhost:3001/api/jobs/create', {
      jobTitle: 'Senior Developer',
      requirements: '5+ years React experience'
    })
    const jobId = jobResponse.data.jobId
    console.log('✅ Job created:', jobId)
    
    // Submit application
    console.log('\n2. Submitting application...')
    const appResponse = await axios.post('http://localhost:3001/api/applications/submit', {
      jobId: jobId,
      formData: JSON.stringify({
        name: 'Test User',
        email: 'test@example.com',
        programmingLanguages: 'JavaScript, React',
        yearsOfCoding: '6 years'
      })
    })
    
    console.log('✅ Application submitted!')
    console.log('\n3. AI Analysis Result:')
    console.log('Score:', appResponse.data.analysis.score)
    console.log('Explanation:', appResponse.data.analysis.explanation)
    console.log('Strengths:', appResponse.data.analysis.strengths)
    console.log('Concerns:', appResponse.data.analysis.concerns)
    console.log('Recommendation:', appResponse.data.analysis.recommendation)
    
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message)
    if (error.response?.data) {
      console.error('Full response:', JSON.stringify(error.response.data, null, 2))
    }
  }
}

testAnalysis()
