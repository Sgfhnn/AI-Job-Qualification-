# 🚀 Deployment Guide - AI Job Qualification Platform

## Overview
This guide covers deploying the AI Job Qualification Platform with:
- **Frontend**: Vercel (Next.js)
- **Backend**: Render (Node.js/Express)

## ✅ Pre-Deployment Checklist

### Backend (Render)
- [x] Gemini API Key configured: `AIzaSyBjiPfXpQaDff1Teq9pUPiB7hyL-wjuPW0`
- [x] Model updated to `gemini-2.0-flash`
- [x] Health check endpoint: `/health`
- [x] CORS enabled for frontend
- [x] Environment variables set in `render.yaml`

### Frontend (Vercel)
- [x] Next.js configuration optimized
- [x] API URL environment variable ready
- [x] Build configuration in `vercel.json`

---

## 🔧 Backend Deployment (Render)

### Option 1: Using render.yaml (Recommended)

1. **Push code to GitHub** (already done)

2. **Connect to Render**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Blueprint"
   - Connect your GitHub repository
   - Render will auto-detect `render.yaml`

3. **Environment Variables** (Already configured in render.yaml)
   ```
   GEMINI_API_KEY=AIzaSyBjiPfXpQaDff1Teq9pUPiB7hyL-wjuPW0
   NODE_ENV=production
   PORT=10000
   ```

4. **Deploy**
   - Click "Apply"
   - Wait for deployment (2-3 minutes)
   - Your backend will be live at: `https://ai-job-backend.onrender.com`

### Option 2: Manual Setup

1. **Create New Web Service**
   - Go to Render Dashboard
   - Click "New +" → "Web Service"
   - Connect GitHub repository

2. **Configure Service**
   - **Name**: `ai-job-backend`
   - **Environment**: `Node`
   - **Build Command**: `cd backend && npm install`
   - **Start Command**: `cd backend && node server-simple.js`
   - **Plan**: Free

3. **Add Environment Variables**
   - `GEMINI_API_KEY` = `AIzaSyBjiPfXpQaDff1Teq9pUPiB7hyL-wjuPW0`
   - `NODE_ENV` = `production`
   - `PORT` = `10000`

4. **Deploy**

### Verify Backend Deployment

After deployment, test these endpoints:

```bash
# Health Check
curl https://your-backend-url.onrender.com/health

# Diagnostic (Check API Key)
curl https://your-backend-url.onrender.com/api/diagnostic

# Should return:
# {"geminiApiKeyValid": "✅ Correct key"}
```

---

## 🎨 Frontend Deployment (Vercel)

### Step 1: Set Environment Variables

Before deploying, set these in Vercel Dashboard:

```env
NEXT_PUBLIC_API_URL=https://your-backend-url.onrender.com
NEXT_PUBLIC_SITE_URL=https://your-app.vercel.app
```

### Step 2: Deploy via Vercel Dashboard

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import your GitHub repository
   - Select the repository

3. **Configure Project**
   - **Framework Preset**: Next.js
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

4. **Add Environment Variables**
   - Click "Environment Variables"
   - Add:
     - `NEXT_PUBLIC_API_URL` = Your Render backend URL
     - `NEXT_PUBLIC_SITE_URL` = Your Vercel app URL (you'll get this after first deploy)

5. **Deploy**
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your frontend will be live!

### Step 3: Update CORS (Important!)

After getting your Vercel URL, update backend CORS if needed:

In `backend/server-simple.js`, CORS is already set to allow all origins:
```javascript
app.use(cors())
```

For production, you can restrict it:
```javascript
app.use(cors({
  origin: 'https://your-app.vercel.app'
}))
```

### Step 4: Redeploy Frontend

After setting the correct `NEXT_PUBLIC_API_URL`:
1. Go to Vercel Dashboard
2. Go to your project → "Deployments"
3. Click "..." on latest deployment → "Redeploy"

---

## 🧪 Testing Deployment

### Test Backend
```bash
# Replace with your actual Render URL
export BACKEND_URL=https://ai-job-backend.onrender.com

# Test health
curl $BACKEND_URL/health

# Test diagnostic
curl $BACKEND_URL/api/diagnostic

# Test job creation
curl -X POST $BACKEND_URL/api/jobs/create \
  -H "Content-Type: application/json" \
  -d '{"jobTitle":"Developer","requirements":"5 years experience"}'
```

### Test Frontend
1. Visit your Vercel URL
2. Try creating a job posting
3. Try applying to a job
4. Check if AI analysis works

---

## 📝 Important URLs

After deployment, you'll have:

- **Frontend (Vercel)**: `https://your-app.vercel.app`
- **Backend (Render)**: `https://ai-job-backend.onrender.com`
- **API Endpoints**:
  - Health: `/health`
  - Diagnostic: `/api/diagnostic`
  - Create Job: `POST /api/jobs/create`
  - Submit Application: `POST /api/applications/submit`

---

## 🔍 Troubleshooting

### Backend Issues

**Problem**: 404 errors on API calls
- **Solution**: Check CORS settings, verify backend URL in frontend env vars

**Problem**: AI not working (fallback responses)
- **Solution**: Check `/api/diagnostic` endpoint
- Verify `geminiApiKeyValid` shows "✅ Correct key"
- If wrong, update environment variable on Render

**Problem**: Server crashes on startup
- **Solution**: Check Render logs
- Verify all dependencies installed
- Check Node version (should be 18+)

### Frontend Issues

**Problem**: "Failed to fetch" errors
- **Solution**: Verify `NEXT_PUBLIC_API_URL` is set correctly
- Check backend is running (visit health endpoint)
- Verify CORS is enabled on backend

**Problem**: Build fails
- **Solution**: Check build logs in Vercel
- Verify all dependencies in `package.json`
- Check TypeScript/ESLint errors (currently ignored in config)

### Common Issues

**Problem**: Render free tier sleeps after inactivity
- **Solution**: First request after sleep takes 30-60 seconds
- Consider using a service like UptimeRobot to ping every 14 minutes
- Or upgrade to paid plan

**Problem**: Environment variables not updating
- **Solution**: After changing env vars, trigger a new deployment
- On Render: Manual Deploy → "Clear build cache & deploy"
- On Vercel: Redeploy from dashboard

---

## 🎯 Post-Deployment Checklist

- [ ] Backend health check returns 200 OK
- [ ] Backend diagnostic shows correct API key
- [ ] Frontend loads without errors
- [ ] Can create a job posting
- [ ] AI form generation works
- [ ] Can submit an application
- [ ] AI candidate analysis works
- [ ] Resume upload works (if implemented)

---

## 🔐 Security Notes

1. **API Key**: Currently hardcoded as fallback in `gemini.js`
   - For production, use environment variables only
   - Remove hardcoded key if needed

2. **CORS**: Currently allows all origins
   - Restrict to your Vercel domain in production

3. **Rate Limiting**: Consider adding rate limiting for production

4. **File Uploads**: Currently stored locally
   - For production, use cloud storage (S3, Cloudinary, etc.)

---

## 📊 Monitoring

### Render
- View logs: Dashboard → Your Service → Logs
- View metrics: Dashboard → Your Service → Metrics
- Set up alerts: Dashboard → Your Service → Settings → Alerts

### Vercel
- View analytics: Dashboard → Your Project → Analytics
- View logs: Dashboard → Your Project → Deployments → [Select] → Logs
- Monitor performance: Dashboard → Your Project → Speed Insights

---

## 🚀 Quick Deploy Commands

```bash
# Push to GitHub (triggers auto-deploy)
git add .
git commit -m "Deploy: AI features fixed and ready for production"
git push origin main

# Render will auto-deploy from GitHub
# Vercel will auto-deploy from GitHub
```

---

## ✅ Deployment Complete!

Your AI Job Qualification Platform is now live! 🎉

**Next Steps:**
1. Share the Vercel URL with users
2. Monitor logs for any issues
3. Set up custom domain (optional)
4. Enable analytics and monitoring
5. Consider adding authentication for employers

---

**Need Help?**
- Render Docs: https://render.com/docs
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
