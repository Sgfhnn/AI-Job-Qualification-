# How to Push Changes to Your GitHub Repository

The Gemini AI candidate analysis fix is complete! Follow these steps to push the changes to your GitHub repository.

## Option 1: Using GitHub Personal Access Token (Recommended for Replit)

### Step 1: Create a Personal Access Token
1. Go to GitHub: https://github.com/settings/tokens
2. Click **"Generate new token"** → **"Generate new token (classic)"**
3. Give it a name like "Replit AI Job Platform"
4. Select scopes:
   - ✅ **repo** (full control of private repositories)
5. Click **"Generate token"**
6. **IMPORTANT**: Copy the token immediately (you won't see it again!)

### Step 2: Configure Git in Replit
Open the Replit Shell and run these commands:

```bash
# Set your GitHub username
git config --global user.name "Your GitHub Username"

# Set your GitHub email
git config --global user.email "your-email@example.com"

# Check git status
git status
```

### Step 3: Stage and Commit Changes
```bash
# Add all modified files
git add backend/services/gemini.js backend/package.json

# Create a commit with a descriptive message
git commit -m "fix: update Gemini model to gemini-2.5-flash for candidate analysis"
```

### Step 4: Push to GitHub
```bash
# Push using HTTPS with your Personal Access Token
# Replace YOUR_TOKEN with the token you copied in Step 1
# Replace Sgfhnn with your GitHub username

git push https://YOUR_TOKEN@github.com/Sgfhnn/AI-Job-Qualification-.git master
```

**Example:**
```bash
git push https://ghp_abc123XYZ456@github.com/Sgfhnn/AI-Job-Qualification-.git master
```

---

## Option 2: Using SSH Keys (Alternative Method)

### Step 1: Generate SSH Key
```bash
# Generate a new SSH key
ssh-keygen -t ed25519 -C "your-email@example.com"

# Press Enter to accept default location
# Press Enter twice to skip passphrase (or set one if you prefer)

# Copy the public key
cat ~/.ssh/id_ed25519.pub
```

### Step 2: Add SSH Key to GitHub
1. Copy the output from the command above (starts with `ssh-ed25519`)
2. Go to GitHub: https://github.com/settings/keys
3. Click **"New SSH key"**
4. Paste your public key
5. Click **"Add SSH key"**

### Step 3: Configure Git and Push
```bash
# Set your GitHub info
git config --global user.name "Your GitHub Username"
git config --global user.email "your-email@example.com"

# Add and commit changes
git add backend/services/gemini.js backend/package.json
git commit -m "fix: update Gemini model to gemini-2.5-flash for candidate analysis"

# Push using SSH
git push git@github.com:Sgfhnn/AI-Job-Qualification-.git master
```

---

## Verify Your Push

After pushing, verify the changes on GitHub:
1. Go to: https://github.com/Sgfhnn/AI-Job-Qualification-
2. Check that your commit appears in the commit history
3. Click on `backend/services/gemini.js` and verify line 9 shows `gemini-2.5-flash`

---

## Deploy the Fix

After pushing to GitHub, you need to redeploy your backend:

### If using Render.com:
1. Go to your Render dashboard: https://dashboard.render.com/
2. Find your backend service
3. Click **"Manual Deploy"** → **"Deploy latest commit"**
4. Wait for deployment to complete

### If using other hosting:
- Trigger a redeploy or manually pull the latest code
- Ensure the `GEMINI_API_KEY` environment variable is set

---

## Test the Fix

After deploying:
1. Go to your application
2. Create a new job posting
3. Submit an application
4. ✅ You should now see proper AI analysis with scores and recommendations instead of "AI analysis unavailable"

---

## Troubleshooting

### "Permission denied" error
- Make sure your Personal Access Token has `repo` permissions
- Verify you're using the correct GitHub username

### "Authentication failed" error
- Double-check that you copied the token correctly
- The token should start with `ghp_` for classic tokens

### "Nothing to commit" message
- Run `git status` to see what files are staged
- Make sure you've modified the files correctly

### Still need help?
- Check the commit was created: `git log --oneline -5`
- Verify remote URL: `git remote -v`
- Ensure you have the latest code: `git pull origin master` (if needed)

---

## Summary of Changes Pushed

```
✅ backend/services/gemini.js - Updated Gemini model name
✅ backend/package.json - Updated server configuration
```

These changes fix the "AI analysis candidate unavailable" error by using the correct Gemini 2.5 Flash model for candidate analysis.
