# AI Job Qualification Platform

An AI-powered recruitment platform that automates candidate screening with **intelligent resume analysis**, **AI-generated application forms**, and an **autonomous voice interviewer** — all built on modern web technologies.

---

## ✨ Key Features

| Feature | Description |
|---|---|
| **AI Form Generation** | Automatically creates tailored application forms based on job requirements using Google Gemini |
| **Resume Intelligence** | Extracts and analyzes text from PDF/DOCX resumes for deep candidate evaluation |
| **AI Candidate Scoring** | Ranks applicants with scores, strengths, concerns, and recommendations |
| **AI Voice Interviewer** | Autonomous conversational AI that conducts human-like technical interviews |
| **Multi-Employer Dashboards** | Isolated dashboards — each employer only sees their own jobs and applicants |
| **Candidate Portal** | Candidates can apply, upload resumes, and check application status |

---

## 🏗 Architecture

```
┌─────────────────┐         ┌──────────────────┐         ┌───────────────┐
│   Next.js 14    │  REST   │   Express.js     │  SDK    │   Supabase    │
│   (Vercel)      │ ──────► │   (Render)       │ ──────► │   (DB + Auth) │
│                 │         │                  │         │               │
│  • App Router   │         │  • Helmet        │         │  • PostgreSQL │
│  • Supabase Auth│         │  • Rate Limiting │         │  • Storage    │
│  • Tailwind CSS │         │  • CORS Whitelist│         │  • Row-Level  │
└─────────────────┘         │  • Multer        │         │    Security   │
                            │  • Google Gemini │         └───────────────┘
                            └──────────────────┘
```

---

## 🛠 Tech Stack

### Frontend
- **Next.js 14** (App Router) + **React 18** + **TypeScript**
- **Tailwind CSS** for styling
- **Supabase Auth Helpers** for authentication
- Deployed on **Vercel**

### Backend
- **Node.js** + **Express.js**
- **Google Gemini AI** for form generation, resume analysis, and interviews
- **Multer** for secure file uploads (10MB limit, PDF/DOC/DOCX only)
- **Helmet** for HTTP security headers
- **express-rate-limit** for API rate limiting
- Deployed on **Render**

### Database & Storage
- **Supabase** (PostgreSQL) for persistent data
- **Supabase Storage** for resume file storage
- **Supabase Auth** for user authentication

---

## 📁 Project Structure

```
├── frontend/                 # Next.js frontend application
│   ├── app/                  # App Router pages
│   │   ├── auth/             # Sign In, Sign Up, Forgot/Reset Password
│   │   ├── employer/         # Dashboard, Create Job, Job Details
│   │   ├── candidate/        # Application Status
│   │   ├── jobs/             # Public job listings
│   │   ├── apply/[jobId]/    # Dynamic application form
│   │   └── interview/        # AI voice interview
│   ├── middleware.ts          # Auth guards & route protection
│   └── lib/                  # Utilities
│
├── backend/                  # Express.js API server
│   ├── server.js             # Main server with all routes
│   ├── services/
│   │   ├── gemini.js         # Google Gemini AI integration
│   │   ├── interview.js      # AI interview service
│   │   └── fileParser.js     # PDF/DOCX text extraction
│   ├── lib/supabase.js       # Supabase client
│   └── config/supabase.js    # Supabase configuration
│
├── .env.example              # Root environment template
└── README.md
```

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.
