const geminiService = require('./services/gemini')

async function testGeminiFix() {
  console.log('🧪 Testing Gemini API Fix...\n')
  
  // Test 1: Form Generation
  console.log('1️⃣ Testing AI Form Generation...')
  try {
    const formFields = await geminiService.generateFormFields(
      'Senior Software Engineer',
      'Looking for a developer with 5+ years experience in React, Node.js, and TypeScript'
    )
    console.log('✅ Form Generation Success!')
    console.log(`   Generated ${formFields.length} fields`)
    console.log(`   Sample field: ${formFields[0].label}`)
  } catch (error) {
    console.log('❌ Form Generation Failed:', error.message)
  }
  
  console.log('\n2️⃣ Testing AI Candidate Analysis...')
  try {
    const analysis = await geminiService.analyzeCandidate(
      'Senior Software Engineer with 5+ years experience in React, Node.js, and TypeScript',
      'John Doe has 6 years of experience in full-stack development with expertise in React, Node.js, and TypeScript.',
      {
        name: 'John Doe',
        email: 'john@example.com',
        yearsExperience: '6',
        skills: 'React, Node.js, TypeScript, MongoDB, AWS'
      }
    )
    console.log('✅ AI Analysis Success!')
    console.log(`   Score: ${analysis.score}%`)
    console.log(`   Strengths: ${analysis.strengths?.length || 0}`)
    console.log(`   Concerns: ${analysis.concerns?.length || 0}`)
    console.log(`   Recommendation: ${analysis.recommendation?.substring(0, 50)}...`)
  } catch (error) {
    console.log('❌ AI Analysis Failed:', error.message)
  }
  
  console.log('\n✅ Test Complete!')
}

testGeminiFix()
