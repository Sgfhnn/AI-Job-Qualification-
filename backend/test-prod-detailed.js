const axios = require('axios')

const BACKEND_URL = 'https://ai-job-qualification.onrender.com'

async function testDetailed() {
  console.log('🔍 DETAILED PRODUCTION TEST\n')
  console.log('Backend URL:', BACKEND_URL)
  console.log('=' .repeat(60))
  
  try {
    // Test 1: Root endpoint
    console.log('\n1️⃣ Testing Root Endpoint (/)...')
    const rootResponse = await axios.get(`${BACKEND_URL}/`)
    console.log('✅ Root Response:', JSON.stringify(rootResponse.data, null, 2))
    
    // Test 2: Health endpoint
    console.log('\n2️⃣ Testing Health Endpoint (/health)...')
    const healthResponse = await axios.get(`${BACKEND_URL}/health`)
    console.log('✅ Health Response:', JSON.stringify(healthResponse.data, null, 2))
    
    // Test 3: Create Job with FULL logging
    console.log('\n3️⃣ Testing Job Creation (/api/jobs/create)...')
    console.log('Sending request...')
    
    const jobResponse = await axios.post(`${BACKEND_URL}/api/jobs/create`, {
      jobTitle: 'React Developer',
      requirements: '3+ years React, TypeScript, Node.js'
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    console.log('✅ Job Creation Response:')
    console.log('  - Success:', jobResponse.data.success)
    console.log('  - Job ID:', jobResponse.data.jobId)
    console.log('  - Form Fields Count:', jobResponse.data.formFields?.length)
    
    if (jobResponse.data.formFields && jobResponse.data.formFields.length > 0) {
      console.log('\n📋 First 5 Form Fields:')
      jobResponse.data.formFields.slice(0, 5).forEach((field, i) => {
        console.log(`  ${i + 1}. ${field.label} (${field.type})`)
      })
      
      // Check if these are AI-generated or fallback
      const hasGenericFields = jobResponse.data.formFields.some(f => 
        f.label === 'Full Name' || f.label === 'Email Address'
      )
      const hasJobSpecificFields = jobResponse.data.formFields.some(f => 
        f.label.toLowerCase().includes('react') || 
        f.label.toLowerCase().includes('developer')
      )
      
      console.log('\n🔍 Field Analysis:')
      console.log('  - Has generic fields:', hasGenericFields ? '✅' : '❌')
      console.log('  - Has job-specific fields:', hasJobSpecificFields ? '✅ (AI WORKING!)' : '❌ (Using fallback)')
    }
    
    const jobId = jobResponse.data.jobId
    
    // Test 4: Submit Application with FULL logging
    console.log('\n4️⃣ Testing Application Submission (/api/applications/submit)...')
    console.log('Sending application...')
    
    const appResponse = await axios.post(`${BACKEND_URL}/api/applications/submit`, {
      jobId: jobId,
      formData: JSON.stringify({
        name: 'Test Candidate',
        email: 'test@example.com',
        programmingLanguages: 'JavaScript, TypeScript, React',
        yearsOfCoding: '4 years',
        frameworksUsed: 'React, Node.js, Express'
      })
    }, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
    
    console.log('✅ Application Submission Response:')
    console.log('  - Success:', appResponse.data.success)
    console.log('  - Application ID:', appResponse.data.applicationId)
    
    const analysis = appResponse.data.analysis
    console.log('\n🤖 AI ANALYSIS RESULTS:')
    console.log('  - Score:', analysis.score + '%')
    console.log('  - Has Explanation:', analysis.explanation ? '✅' : '❌')
    console.log('  - Strengths Count:', analysis.strengths?.length || 0)
    console.log('  - Concerns Count:', analysis.concerns?.length || 0)
    console.log('  - Has Recommendation:', analysis.recommendation ? '✅' : '❌')
    
    if (analysis.explanation) {
      console.log('\n📝 Explanation Preview:')
      console.log('  ', analysis.explanation.substring(0, 150) + '...')
    }
    
    if (analysis.strengths && analysis.strengths.length > 0) {
      console.log('\n💪 Strengths:')
      analysis.strengths.forEach((s, i) => {
        console.log(`  ${i + 1}. ${s}`)
      })
    }
    
    // Determine if AI is really working
    const isRealAI = analysis.score !== 70 && 
                     analysis.score !== 95 && 
                     analysis.explanation && 
                     analysis.explanation.length > 100 &&
                     analysis.strengths && 
                     analysis.strengths.length >= 3
    
    console.log('\n' + '='.repeat(60))
    if (isRealAI) {
      console.log('🎉 VERDICT: AI IS WORKING! Real analysis detected.')
    } else {
      console.log('⚠️  VERDICT: Using FALLBACK. AI may not be working.')
      console.log('    Score is generic:', analysis.score === 70 || analysis.score === 95)
      console.log('    Explanation length:', analysis.explanation?.length || 0)
      console.log('    Strengths count:', analysis.strengths?.length || 0)
    }
    console.log('='.repeat(60))
    
  } catch (error) {
    console.error('\n❌ TEST FAILED!')
    console.error('Error Message:', error.message)
    if (error.response) {
      console.error('Status Code:', error.response.status)
      console.error('Response Data:', JSON.stringify(error.response.data, null, 2))
    }
    if (error.code) {
      console.error('Error Code:', error.code)
    }
  }
}

testDetailed()
