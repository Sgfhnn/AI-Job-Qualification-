const axios = require('axios');
require('dotenv').config();

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in environment variables');
    return;
  }
  console.log('Using API Key:', apiKey.substring(0, 10) + '...');

  try {
    console.log('Listing models from v1beta...');
    const response = await axios.get(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    console.log('Available models:');
    response.data.models.forEach(m => {
      console.log(`- ${m.name} (${m.displayName})`);
    });
  } catch (error) {
    console.error('❌ Failed to list models:', error.message);
    if (error.response) {
      console.error('Error details:', error.response.data);
    }
  }
}

listModels();
