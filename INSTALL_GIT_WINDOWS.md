# Install Git on Windows

You need Git installed to push your code to GitHub. Here are two options:

## Option 1: GitHub Desktop (Easiest - Recommended for Beginners)

### Step 1: Download GitHub Desktop
1. Go to https://desktop.github.com/
2. Click "Download for Windows"
3. Run the installer
4. Sign in with your GitHub account (or create one)

### Step 2: Add Your Project
1. Open GitHub Desktop
2. Click "File" → "Add local repository"
3. Click "Choose..." and select your `scalable-web-app` folder
4. Click "create a repository" link
5. Name: `scalable-web-app`
6. Click "Create Repository"

### Step 3: Publish to GitHub
1. Click "Publish repository" button (top right)
2. Uncheck "Keep this code private" (or keep it checked if you want it private)
3. Click "Publish repository"
4. Done! Your code is now on GitHub! 🎉

### Step 4: Deploy to Vercel
1. Go to https://vercel.com/signup
2. Sign up with GitHub
3. Click "Add New..." → "Project"
4. Find your `scalable-web-app` repository
5. Click "Import"
6. Add environment variable:
   - Name: `JWT_SECRET`
   - Value: `your-super-secret-random-string-at-least-32-characters-long`
7. Click "Deploy"
8. Wait 2-3 minutes
9. Your app is live! 🎉

### To Update Your App Later
1. Make changes to your code
2. Open GitHub Desktop
3. Write a summary of changes (e.g., "Added new feature")
4. Click "Commit to main"
5. Click "Push origin"
6. Vercel automatically deploys the update!

---

## Option 2: Git Command Line (For Advanced Users)

### Step 1: Download Git
1. Go to https://git-scm.com/download/win
2. Download the installer (64-bit recommended)
3. Run the installer
4. Use default settings (just keep clicking "Next")
5. Finish installation

### Step 2: Verify Installation
Open a **new** Command Prompt and run:
```bash
git --version
```

You should see something like: `git version 2.x.x`

### Step 3: Configure Git
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Step 4: Initialize and Push
```bash
cd C:\Users\malle\Desktop\workshop\scalable-web-app
git init
git add .
git commit -m "Initial commit: Scalable Web App"
```

### Step 5: Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `scalable-web-app`
3. Click "Create repository"

### Step 6: Push to GitHub
```bash
git remote add origin https://github.com/YOUR_USERNAME/scalable-web-app.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

---

## Which Option Should I Choose?

### Choose GitHub Desktop if:
- ✅ You're new to Git
- ✅ You prefer visual interfaces
- ✅ You want the easiest experience
- ✅ You don't want to use command line

### Choose Git Command Line if:
- ✅ You're comfortable with terminal/command prompt
- ✅ You want more control
- ✅ You plan to use Git frequently
- ✅ You want to learn Git commands

---

## After Installing Git

Once your code is on GitHub, follow the Vercel deployment steps in **GITHUB_DEPLOY.md**

## Need Help?

- GitHub Desktop Help: https://docs.github.com/en/desktop
- Git Documentation: https://git-scm.com/doc
- Vercel Documentation: https://vercel.com/docs

---

**Recommendation:** Start with GitHub Desktop - it's much easier and does everything you need!
