// Set the API key directly for testing
process.env.GEMINI_API_KEY = 'AIzaSyBjiPfXpQaDff1Teq9pUPiB7hyL-wjuPW0'

const geminiService = require('./services/gemini')

async function testAI() {
  console.log('Environment check:')
  console.log('GEMINI_API_KEY:', process.env.GEMINI_API_KEY ? `Found: ${process.env.GEMINI_API_KEY.substring(0, 10)}...` : 'Not found')
  console.log('Testing AI Form Generation...')
  
  // Test 1: Software Developer
  console.log('\n=== TEST 1: Software Developer ===')
  const devFields = await geminiService.generateFormFields(
    'Senior Full Stack Developer',
    'We are looking for a senior full stack developer with 5+ years experience in React, Node.js, and PostgreSQL. Must have experience with AWS, Docker, and microservices architecture. Strong problem-solving skills and ability to work in agile environment required.'
  )
  console.log('Generated fields:', devFields.length)
  devFields.forEach(field => console.log(`- ${field.name}: ${field.label} (${field.type})`))

  // Test 2: Marketing Manager
  console.log('\n=== TEST 2: Marketing Manager ===')
  const marketingFields = await geminiService.generateFormFields(
    'Digital Marketing Manager',
    'Seeking an experienced digital marketing manager to lead our online marketing efforts. Must have experience with Google Ads, Facebook advertising, email marketing campaigns, and analytics. 3+ years experience required. Knowledge of SEO and content marketing preferred.'
  )
  console.log('Generated fields:', marketingFields.length)
  marketingFields.forEach(field => console.log(`- ${field.name}: ${field.label} (${field.type})`))

  // Test 3: Sales Representative
  console.log('\n=== TEST 3: Sales Representative ===')
  const salesFields = await geminiService.generateFormFields(
    'B2B Sales Representative',
    'Looking for an energetic B2B sales representative to join our growing team. Must have experience in cold calling, lead generation, and closing deals. CRM experience required. Previous experience in SaaS or technology sales preferred. Commission-based compensation with base salary.'
  )
  console.log('Generated fields:', salesFields.length)
  salesFields.forEach(field => console.log(`- ${field.name}: ${field.label} (${field.type})`))

  console.log('\n=== Testing AI Candidate Analysis ===')
  
  // Test candidate analysis
  const mockFormData = {
    name: 'John Smith',
    email: 'john@example.com',
    programmingLanguages: 'JavaScript (Expert), Python (Intermediate), Java (Beginner)',
    frameworksUsed: 'React, Node.js, Express, Django',
    yearsOfCoding: '3-5 years',
    githubProfile: 'https://github.com/johnsmith',
    projectPortfolio: 'Built e-commerce platform with React/Node.js, Created REST API for mobile app'
  }
  
  const mockResume = `
JOHN SMITH
Software Developer
Email: john@example.com

EXPERIENCE:
Software Developer at TechCorp (2021-2024)
- Developed full-stack web applications using React and Node.js
- Built RESTful APIs and integrated with PostgreSQL databases
- Collaborated with cross-functional teams in agile environment
- Implemented CI/CD pipelines using Docker and AWS

Junior Developer at StartupXYZ (2020-2021)
- Created responsive web interfaces using HTML, CSS, JavaScript
- Worked with senior developers on code reviews and best practices

EDUCATION:
Bachelor of Computer Science, State University (2020)

SKILLS:
JavaScript, React, Node.js, PostgreSQL, AWS, Docker, Git
`

  const analysis = await geminiService.analyzeCandidate(
    'We are looking for a senior full stack developer with 5+ years experience in React, Node.js, and PostgreSQL. Must have experience with AWS, Docker, and microservices architecture.',
    mockResume,
    mockFormData
  )
  
  console.log('\nCandidate Analysis Result:')
  console.log('Score:', analysis.score)
  console.log('Explanation:', analysis.explanation)
  console.log('Strengths:', analysis.strengths)
  console.log('Concerns:', analysis.concerns)
  console.log('Recommendation:', analysis.recommendation)
}

testAI().catch(console.error)
