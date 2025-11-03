const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');

async function testBackendFlow() {
  const baseURL = 'http://localhost:5000';
  
  console.log('🧪 Testing Backend API Flow...\n');
  
  try {
    // Test 1: Health Check
    console.log('1️⃣ Testing health check...');
    const healthResponse = await axios.get(`${baseURL}/health`);
    console.log('✅ Health check passed:', healthResponse.data);
    
    // Test 2: Create a job with AI form generation
    console.log('\n2️⃣ Creating job with AI form generation...');
    const createJobResponse = await axios.post(`${baseURL}/api/jobs/create`, {
      jobTitle: 'Full Stack Developer',
      requirements: '3+ years experience with React, Node.js, and TypeScript. Strong problem-solving skills.'
    });
    
    if (!createJobResponse.data.success) {
      throw new Error('Failed to create job');
    }
    
    const jobId = createJobResponse.data.jobId;
    const formFields = createJobResponse.data.formFields;
    console.log(`✅ Job created with ID: ${jobId}`);
    console.log(`✅ Generated ${formFields.length} form fields`);
    console.log('   Sample fields:', formFields.slice(0, 3).map(f => f.name).join(', '));
    
    // Test 3: Get job details
    console.log('\n3️⃣ Fetching job details...');
    const jobResponse = await axios.get(`${baseURL}/api/jobs/${jobId}`);
    console.log('✅ Job details retrieved:', jobResponse.data.job.title);
    
    // Test 4: Submit application with candidate analysis
    console.log('\n4️⃣ Submitting application with AI analysis...');
    
    const formData = new FormData();
    formData.append('jobId', jobId);
    formData.append('formData', JSON.stringify({
      name: 'Jane Developer',
      email: 'jane@example.com',
      phone: '123-456-7890',
      years_experience: '5',
      education: "Bachelor's",
      key_skills: 'React, Node.js, TypeScript, PostgreSQL, Docker',
      portfolio: 'https://github.com/janedeveloper',
      why_interested: 'I am passionate about building scalable web applications and would love to work on challenging projects.',
      availability: 'Immediately',
      salary_range: '$80,000-$100,000'
    }));
    
    // Create a simple dummy resume file
    const dummyResumeContent = `
JANE DEVELOPER
Full Stack Developer

EXPERIENCE:
- 5 years of experience in web development
- Expert in React, Node.js, and TypeScript
- Built several production applications serving 100K+ users
- Strong problem-solving and team collaboration skills

EDUCATION:
Bachelor's Degree in Computer Science

SKILLS:
React, Node.js, TypeScript, PostgreSQL, Docker, Git, AWS
    `.trim();
    
    const resumePath = '/tmp/test-resume.txt';
    fs.writeFileSync(resumePath, dummyResumeContent);
    formData.append('resume', fs.createReadStream(resumePath));
    
    const submitResponse = await axios.post(
      `${baseURL}/api/applications/submit`,
      formData,
      {
        headers: formData.getHeaders(),
        maxBodyLength: Infinity
      }
    );
    
    if (!submitResponse.data.success) {
      throw new Error('Failed to submit application');
    }
    
    console.log('✅ Application submitted successfully!');
    console.log('   Application ID:', submitResponse.data.applicationId);
    console.log('   AI Analysis:');
    console.log('   - Score:', submitResponse.data.analysis.score);
    console.log('   - Summary:', submitResponse.data.analysis.summary.substring(0, 100) + '...');
    console.log('   - Strengths:', submitResponse.data.analysis.strengths.slice(0, 2).join(', '));
    console.log('   - Recommendation:', submitResponse.data.analysis.recommendation);
    
    // Clean up
    fs.unlinkSync(resumePath);
    
    console.log('\n🎉 All tests passed! The Gemini AI candidate analysis is working correctly!');
    process.exit(0);
    
  } catch (error) {
    console.error('\n❌ Test failed:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
    process.exit(1);
  }
}

testBackendFlow();
