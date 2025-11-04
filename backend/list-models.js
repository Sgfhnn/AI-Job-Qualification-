const axios = require('axios')

const apiKey = 'AIzaSyBjiPfXpQaDff1Teq9pUPiB7hyL-wjuPW0'

async function listModels() {
  try {
    console.log('Fetching available Gemini models...\n')
    
    const response = await axios.get(
      `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`
    )
    
    console.log('Available models:')
    response.data.models.forEach(model => {
      console.log(`- ${model.name}`)
      console.log(`  Display Name: ${model.displayName}`)
      console.log(`  Supported Methods: ${model.supportedGenerationMethods?.join(', ')}`)
      console.log('')
    })
  } catch (error) {
    console.error('Error:', error.response?.data || error.message)
  }
}

listModels()
