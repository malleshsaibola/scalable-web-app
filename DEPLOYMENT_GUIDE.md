# Deployment Guide - GitHub & Vercel

This guide will help you deploy your scalable web app to GitHub and host it on Vercel for free.

## Step 1: Prepare Your Project

### 1.1 Create .env.example file

Create a `.env.example` file to show what environment variables are needed:

```bash
# Copy this to .env.local and set your values
JWT_SECRET=your-secret-key-change-in-production-use-long-random-string
```

### 1.2 Update package.json scripts

Your package.json already has the correct scripts:
- `npm run dev` - Development server
- `npm run build` - Production build
- `npm start` - Production server

## Step 2: Push to GitHub

### 2.1 Initialize Git (if not already done)

```bash
cd scalable-web-app
git init
```

### 2.2 Add all files

```bash
git add .
```

### 2.3 Create first commit

```bash
git commit -m "Initial commit: Scalable Web App with authentication and task management"
```

### 2.4 Create GitHub repository

1. Go to [GitHub.com](https://github.com)
2. Click the "+" icon in the top right
3. Select "New repository"
4. Name it: `scalable-web-app` (or your preferred name)
5. **Don't** initialize with README (you already have files)
6. Click "Create repository"

### 2.5 Connect and push to GitHub

GitHub will show you commands. Use these:

```bash
git remote add origin https://github.com/YOUR_USERNAME/scalable-web-app.git
git branch -M main
git push -u origin main
```

Replace `YOUR_USERNAME` with your GitHub username.

## Step 3: Deploy to Vercel (Free Hosting)

### 3.1 Sign up for Vercel

1. Go to [vercel.com](https://vercel.com)
2. Click "Sign Up"
3. Choose "Continue with GitHub"
4. Authorize Vercel to access your GitHub

### 3.2 Import your project

1. Click "Add New..." → "Project"
2. Find your `scalable-web-app` repository
3. Click "Import"

### 3.3 Configure project

Vercel will auto-detect Next.js. Configure:

**Framework Preset:** Next.js (auto-detected)  
**Root Directory:** `./` (leave as is)  
**Build Command:** `npm run build` (auto-filled)  
**Output Directory:** `.next` (auto-filled)

### 3.4 Add Environment Variables

Click "Environment Variables" and add:

```
JWT_SECRET = your-super-secret-key-at-least-32-characters-long-random-string
```

**Important:** Generate a secure random string for production!

You can generate one with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 3.5 Deploy

1. Click "Deploy"
2. Wait 2-3 minutes for build to complete
3. You'll get a URL like: `https://scalable-web-app-xxx.vercel.app`

## Step 4: Test Your Deployment

1. Visit your Vercel URL
2. Register a new account
3. Login and test all features:
   - Create tasks
   - Edit tasks
   - Delete tasks
   - Search and filter
   - Update profile
   - Logout

## Step 5: Custom Domain (Optional)

### Free Vercel Domain
Your app is already live at: `https://your-app-name.vercel.app`

### Custom Domain
1. Go to your project settings in Vercel
2. Click "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

## Important Notes

### Database Persistence

⚠️ **Important:** The JSON database (`app.db.json`) is stored in the filesystem, which is **ephemeral** on Vercel. This means:

- Data will be lost on each deployment
- Data may be lost when the serverless function restarts
- **This is fine for demo/development**

### For Production

For a production app, you should:

1. **Use a real database:**
   - PostgreSQL (Vercel Postgres, Supabase, Neon)
   - MongoDB (MongoDB Atlas)
   - MySQL (PlanetScale)

2. **Update environment variables:**
   - Add database connection string
   - Update `lib/db.ts` to use the database

3. **Add database migrations:**
   - Use Prisma, Drizzle, or similar ORM
   - Run migrations on deployment

## Continuous Deployment

Once connected to GitHub, Vercel automatically:
- Deploys on every push to `main` branch
- Creates preview deployments for pull requests
- Runs builds and shows errors

### To update your app:

```bash
# Make changes to your code
git add .
git commit -m "Description of changes"
git push
```

Vercel will automatically deploy the new version!

## Troubleshooting

### Build fails on Vercel

Check the build logs in Vercel dashboard. Common issues:
- Missing environment variables
- TypeScript errors
- Missing dependencies

### App works locally but not on Vercel

- Check environment variables are set
- Check build logs for errors
- Ensure all dependencies are in `package.json`

### Database issues

Remember: JSON database is ephemeral on Vercel. For persistent data, use a real database service.

## Alternative Hosting Options

### Netlify
1. Similar to Vercel
2. Connect GitHub repository
3. Auto-deploy on push

### Railway
1. Supports persistent filesystem
2. Good for apps with file-based databases
3. Free tier available

### Render
1. Free tier for web services
2. Persistent disk storage available
3. Good for full-stack apps

## Security Checklist

Before going to production:

- [ ] Change JWT_SECRET to a strong random string
- [ ] Use HTTPS (Vercel provides this automatically)
- [ ] Add rate limiting for API routes
- [ ] Implement CORS properly
- [ ] Add input sanitization
- [ ] Use a real database with backups
- [ ] Add monitoring and error tracking
- [ ] Implement proper logging

## Next Steps

1. **Add a real database** (PostgreSQL recommended)
2. **Set up monitoring** (Vercel Analytics, Sentry)
3. **Add tests** (Jest, Playwright)
4. **Implement CI/CD** (GitHub Actions)
5. **Add email verification**
6. **Implement password reset**
7. **Add social login** (Google, GitHub)

## Support

If you encounter issues:
- Check Vercel documentation: https://vercel.com/docs
- Check Next.js documentation: https://nextjs.org/docs
- GitHub Issues for your repository

---

**Congratulations!** 🎉 Your app is now live on the internet!
