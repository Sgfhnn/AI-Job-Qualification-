const axios = require('axios');

async function testGeminiAPI() {
  console.log('🔧 Testing Gemini API...');
  console.log('📌 API Key:', process.env.GEMINI_API_KEY ? '✅ Found' : '❌ Missing');
  
  if (!process.env.GEMINI_API_KEY) {
    console.error('❌ GEMINI_API_KEY not found in environment');
    process.exit(1);
  }
  
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
    
    const prompt = `Analyze this candidate for a Software Developer position:
    
Job Requirements: 3+ years of JavaScript experience, React knowledge, team player

Candidate Data:
- Name: Test Candidate
- Years Experience: 5
- Skills: JavaScript, React, Node.js, TypeScript
- Why interested: Passionate about building great user interfaces

Return ONLY this JSON format:
{
  "score": <number 0-100>,
  "explanation": "<brief explanation>",
  "strengths": ["<strength 1>", "<strength 2>"],
  "concerns": ["<concern 1>"],
  "recommendation": "<hire/consider/reject>"
}`;
    
    console.log('🚀 Sending test request to Gemini API...');
    
    const response = await axios.post(
      baseUrl,
      {
        contents: [{
          parts: [{
            text: prompt
          }]
        }],
        generationConfig: {
          temperature: 0.3,
          topK: 40,
          topP: 0.95,
          maxOutputTokens: 2048,
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-goog-api-key': apiKey
        },
        timeout: 30000
      }
    );
    
    const text = response.data.candidates[0].content.parts[0].text;
    
    console.log('✅ Gemini API Response:');
    console.log(text);
    
    // Try to parse JSON
    const jsonMatch = text.match(/\{[\s\S]*?\}/);
    if (jsonMatch) {
      const analysis = JSON.parse(jsonMatch[0]);
      console.log('\n✅ Parsed Analysis:');
      console.log('Score:', analysis.score);
      console.log('Recommendation:', analysis.recommendation);
      console.log('\n🎉 Gemini API is working correctly!');
    } else {
      console.log('⚠️ Response received but JSON parsing needs adjustment');
    }
    
  } catch (error) {
    console.error('❌ Gemini API Error:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Response data:', JSON.stringify(error.response.data, null, 2));
    }
    if (error.message.includes('API_KEY_INVALID')) {
      console.error('🔑 The API key appears to be invalid. Please check your GEMINI_API_KEY.');
    }
    process.exit(1);
  }
}

testGeminiAPI();
