# Deployment Fix Guide

## Changes Pushed ✅

All fixes have been pushed to GitHub. Now you need to redeploy on Render.

## What Was Fixed

1. ✅ **Updated Gemini API Key** in `render.yaml`
2. ✅ **Fixed server-simple.js** to use geminiService
3. ✅ **Added root route** (fixes "Cannot GET /")
4. ✅ **Updated all backend files** with correct API key

## Render Deployment Steps

### Option 1: Automatic Redeploy (If Auto-Deploy is Enabled)
Render will automatically detect the GitHub push and redeploy. Wait 2-5 minutes.

### Option 2: Manual Redeploy
1. Go to https://dashboard.render.com/
2. Find your `ai-job-backend` service
3. Click **"Manual Deploy"** → **"Deploy latest commit"**
4. Wait for deployment to complete (2-5 minutes)

### Option 3: Update Environment Variable Directly
If the deployment doesn't pick up the new API key from render.yaml:

1. Go to your service on Render dashboard
2. Click **"Environment"** tab
3. Find `GEMINI_API_KEY`
4. Update value to: `AIzaSyBjiPfXpQaDff1Teq9pUPiB7hyL-wjuPW0`
5. Click **"Save Changes"**
6. Service will automatically redeploy

## Vercel Frontend Update

Your frontend also needs to be redeployed to pick up any changes:

1. Go to https://vercel.com/dashboard
2. Find your project
3. Click **"Deployments"**
4. Click **"Redeploy"** on the latest deployment
5. Or push any change to trigger auto-deploy

## Testing After Deployment

### Test Backend (Render)
Visit: `https://ai-job-qualification.onrender.com/`

Should see:
```json
{
  "status": "OK",
  "message": "AI Job Platform API",
  "version": "1.0.0",
  "endpoints": { ... }
}
```

### Test Health Endpoint
Visit: `https://ai-job-qualification.onrender.com/health`

Should see:
```json
{
  "status": "OK",
  "message": "AI Job Platform API is running"
}
```

### Test Job Creation
```bash
curl -X POST https://ai-job-qualification.onrender.com/api/jobs/create \
  -H "Content-Type: application/json" \
  -d '{"jobTitle":"Test Job","requirements":"Test requirements"}'
```

Should return job with generated form fields.

## Common Issues

### Issue 1: "AI analysis temporarily unavailable"
**Cause**: Old deployment still running with old API key
**Fix**: Force redeploy on Render or update environment variable

### Issue 2: "Cannot GET /"
**Cause**: Accessing root route before redeploy
**Fix**: Wait for redeploy to complete, then refresh

### Issue 3: CORS errors from frontend
**Cause**: Frontend pointing to wrong backend URL
**Fix**: Check Vercel environment variables:
- `NEXT_PUBLIC_API_URL` should be `https://ai-job-qualification.onrender.com`

## Local Development

For local testing:

1. **Backend**: Already running on `localhost:3001`
2. **Frontend**: Create `frontend/.env.local`:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```
3. Run frontend: `cd frontend && npm run dev`

## Verification Checklist

After deployment completes:

- [ ] Backend root route works (shows API info)
- [ ] Health endpoint returns OK
- [ ] Can create jobs with AI form generation
- [ ] Can submit applications with AI analysis
- [ ] Frontend connects to backend successfully
- [ ] No CORS errors in browser console

## Current Status

✅ **Code pushed to GitHub**: All fixes committed
⏳ **Waiting for**: Render to redeploy (automatic or manual)
📝 **Next step**: Check Render dashboard for deployment status

## Support

If issues persist after redeployment:
1. Check Render logs for errors
2. Verify environment variables are set correctly
3. Test endpoints directly with curl/Postman
4. Check browser console for frontend errors
