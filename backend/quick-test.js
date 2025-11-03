const axios = require('axios')

async function quickTest() {
  try {
    console.log('Testing job creation...')
    const response = await axios.post('http://localhost:3001/api/jobs/create', {
      jobTitle: 'Test Developer',
      requirements: 'Testing requirements'
    })
    console.log('✅ Success:', response.data)
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message)
    if (error.response?.data) {
      console.error('Full error:', JSON.stringify(error.response.data, null, 2))
    }
  }
}

quickTest()
