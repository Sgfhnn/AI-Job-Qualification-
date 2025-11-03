const axios = require('axios');

async function listModels() {
  console.log('📋 Listing available Gemini models...');
  
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found');
    process.exit(1);
  }
  
  try {
    // Try v1beta endpoint
    console.log('\n🔍 Trying v1beta endpoint...');
    const responseV1Beta = await axios.get(
      'https://generativelanguage.googleapis.com/v1beta/models',
      {
        headers: {
          'X-goog-api-key': apiKey
        }
      }
    );
    
    console.log('✅ Available models in v1beta:');
    responseV1Beta.data.models.forEach(model => {
      console.log(`  - ${model.name} (${model.displayName})`);
      console.log(`    Supported: ${model.supportedGenerationMethods.join(', ')}`);
    });
    
  } catch (error) {
    console.error('❌ v1beta error:', error.response?.data || error.message);
    
    // Try v1 endpoint
    try {
      console.log('\n🔍 Trying v1 endpoint...');
      const responseV1 = await axios.get(
        'https://generativelanguage.googleapis.com/v1/models',
        {
          headers: {
            'X-goog-api-key': apiKey
          }
        }
      );
      
      console.log('✅ Available models in v1:');
      responseV1.data.models.forEach(model => {
        console.log(`  - ${model.name} (${model.displayName})`);
        console.log(`    Supported: ${model.supportedGenerationMethods.join(', ')}`);
      });
      
    } catch (v1Error) {
      console.error('❌ v1 error:', v1Error.response?.data || v1Error.message);
      console.error('\n🔑 The API key may be invalid or have restricted access.');
      console.error('Please verify your GEMINI_API_KEY at: https://makersuite.google.com/app/apikey');
    }
  }
}

listModels();
