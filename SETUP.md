# AI Job Qualification Platform - Setup Instructions

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Supabase account (already configured with provided credentials)

## Quick Start

1. **Install dependencies for all modules:**
   ```bash
   npm run install:all
   ```

2. **Set up the database:**
   - Go to your Supabase project: https://wuualhtukpgecdzrnlwq.supabase.co
   - Navigate to SQL Editor
   - Copy and paste the contents of `database-schema.sql`
   - Run the SQL script to create tables and policies

3. **Start the development servers:**
   ```bash
   npm run dev
   ```

   This will start both frontend (Next.js on port 3000) and backend (Express on port 3001) concurrently.

## Individual Setup

### Backend Setup
```bash
cd backend
npm install
npm run dev
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

## Environment Variables

The backend uses environment variables from `.env` file (already configured):
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_KEY`: Supabase service role key
- `GEMINI_API_KEY`: Google Gemini API key
- `PORT`: Backend server port (default: 3001)

## Testing the Application

1. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:3001

2. **Create a job (Employer flow):**
   - Go to http://localhost:3000/employer
   - Enter job title and requirements
   - AI will generate a custom application form
   - Get a shareable link for applicants

3. **Apply to jobs (Applicant flow):**
   - Go to http://localhost:3000/jobs to see available jobs
   - Click "Apply Now" on any job
   - Fill out the AI-generated form and upload resume
   - Submit application

4. **View applications (Employer dashboard):**
   - After creating a job, you'll be redirected to the dashboard
   - View all applicants with AI-generated scores and analysis
   - Sort by score or application date

## API Endpoints

### Jobs
- `POST /api/jobs/create` - Create new job with AI-generated form
- `GET /api/jobs` - Get all jobs
- `GET /api/jobs/:jobId` - Get specific job
- `GET /api/jobs/:jobId/applicants` - Get applicants for a job

### Applications
- `POST /api/applications/submit` - Submit job application with resume

## Features

✅ **Employer Job Creation**: AI-powered form generation based on job requirements
✅ **Dynamic Application Forms**: Custom forms tailored to each job posting
✅ **Resume Upload & Analysis**: PDF resume parsing and AI analysis
✅ **AI Candidate Ranking**: Automatic scoring and explanation of candidate fit
✅ **Employer Dashboard**: View and sort applicants by AI score
✅ **Responsive UI**: Modern, mobile-friendly interface with Tailwind CSS

## Troubleshooting

1. **Database connection issues**: Verify Supabase credentials in `.env`
2. **AI generation fails**: Check Gemini API key and quota
3. **File upload issues**: Ensure `backend/uploads` directory exists
4. **CORS errors**: Backend runs on port 3001, frontend on 3000

## Architecture

- **Frontend**: Next.js 14 with TypeScript and Tailwind CSS
- **Backend**: Express.js with Node.js
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini API for form generation and candidate analysis
- **File Storage**: Supabase Storage for resume files
