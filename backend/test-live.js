const axios = require('axios')

const BASE_URL = 'http://localhost:3001'

async function testLiveAPI() {
  console.log('🧪 Testing Live API with Gemini Integration...\n')
  
  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing Health Endpoint...')
    const healthResponse = await axios.get(`${BASE_URL}/health`)
    console.log('✅ Health Check:', healthResponse.data)
    
    // Test 2: Create a Job with AI Form Generation
    console.log('\n2️⃣ Creating Job with AI Form Generation...')
    const jobData = {
      title: 'Senior React Developer',
      requirements: '5+ years experience with React, TypeScript, Node.js, and AWS. Must have experience with microservices and agile development.'
    }
    
    const createJobResponse = await axios.post(`${BASE_URL}/api/jobs/create`, {
      jobTitle: jobData.title,
      requirements: jobData.requirements
    })
    console.log('✅ Job Created:', {
      jobId: createJobResponse.data.jobId,
      formFieldsCount: createJobResponse.data.formFields.length
    })
    console.log('📋 Generated Form Fields:')
    createJobResponse.data.formFields.slice(0, 5).forEach(field => {
      console.log(`   - ${field.label} (${field.type})`)
    })
    
    const jobId = createJobResponse.data.jobId
    
    // Test 3: Submit Application with AI Analysis
    console.log('\n3️⃣ Submitting Application for AI Analysis...')
    const formDataToSubmit = {
      name: 'John Doe',
      email: 'john@example.com',
      programmingLanguages: 'JavaScript, TypeScript, Python',
      yearsOfExperience: '6 years',
      frameworks: 'React, Node.js, Express, Next.js',
      cloudExperience: 'AWS (EC2, S3, Lambda), Docker, Kubernetes'
    }
    
    const applicationData = {
      jobId: jobId,
      formData: JSON.stringify(formDataToSubmit)
    }
    
    const submitResponse = await axios.post(`${BASE_URL}/api/applications/submit`, applicationData)
    console.log('✅ Application Submitted Successfully!')
    console.log('\n🤖 AI Analysis Results:')
    console.log(`   Score: ${submitResponse.data.analysis.score}%`)
    console.log(`   Explanation: ${submitResponse.data.analysis.explanation}`)
    console.log(`   Strengths:`)
    submitResponse.data.analysis.strengths.forEach(s => console.log(`      ✓ ${s}`))
    console.log(`   Concerns:`)
    submitResponse.data.analysis.concerns.forEach(c => console.log(`      ⚠ ${c}`))
    console.log(`   Recommendation: ${submitResponse.data.analysis.recommendation}`)
    
    console.log('\n✅ ALL TESTS PASSED! Gemini API is working correctly! 🎉')
    
  } catch (error) {
    console.error('❌ Test Failed:', error.response?.data || error.message)
    process.exit(1)
  }
}

testLiveAPI()
