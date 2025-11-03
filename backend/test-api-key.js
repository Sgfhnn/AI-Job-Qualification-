const axios = require('axios')

const API_KEY = 'AIzaSyBjiPfXpQaDff1Teq9pUPiB7hyL-wjuPW0'

async function testAPIKey() {
  console.log('Testing Gemini API Key...')
  console.log('API Key:', API_KEY.substring(0, 15) + '...')
  
  // Try to list available models
  try {
    console.log('\n1. Listing available models...')
    const listResponse = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${API_KEY}`
    )
    
    console.log('✅ API Key is valid!')
    console.log('\nAvailable models:')
    listResponse.data.models.forEach(model => {
      console.log(`- ${model.name} (${model.displayName})`)
      if (model.supportedGenerationMethods) {
        console.log(`  Supported methods: ${model.supportedGenerationMethods.join(', ')}`)
      }
    })
  } catch (error) {
    console.error('❌ Error listing models:', error.response?.data || error.message)
    
    if (error.response?.status === 403) {
      console.error('\n⚠️  API Key issue: The API key may be invalid, expired, or does not have Gemini API enabled.')
      console.error('Please check:')
      console.error('1. The API key is correct')
      console.error('2. Gemini API is enabled in Google Cloud Console')
      console.error('3. Billing is set up (if required)')
    }
  }
}

testAPIKey()
