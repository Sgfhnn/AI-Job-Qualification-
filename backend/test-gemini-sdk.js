const { GoogleGenerativeAI } = require('@google/generative-ai');
require('dotenv').config();

async function testGeminiSDK() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error('❌ GEMINI_API_KEY not found in environment variables');
        return;
    }
    console.log('Using API Key:', apiKey.substring(0, 10) + '...');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
        }
    });

    const prompt = `Create a JSON array of 3 job-specific form fields for a "Software Engineer" role. 
  Return ONLY the JSON array. No markdown.`;

    console.log('Sending prompt to gemini-1.5-flash...');
    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('--- RAW RESPONSE ---');
        console.log(text);
        console.log('--- END RESPONSE ---');
        console.log('Response length:', text.length);

        // Try parsing
        let cleanText = text.replace(/```json\s*/gi, '').replace(/```\s*/g, '').trim();
        const jsonMatch = cleanText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            console.log('✅ Successfully parsed JSON array with', parsed.length, 'items');
        } else {
            console.log('❌ Could not find JSON array in response');
        }
    } catch (error) {
        console.error('❌ SDK Test Failed:', error.message);
        if (error.response) {
            console.error('Error details:', error.response.data);
        }
    }
}

testGeminiSDK();
