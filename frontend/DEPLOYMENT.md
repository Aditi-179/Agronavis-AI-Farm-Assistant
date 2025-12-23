# Frontend Deployment Guide (Vercel)

## Prerequisites
- GitHub account
- Vercel account (sign up at vercel.com)
- Your Supabase credentials
- OpenWeatherMap API key

---

## Step 1: Push to GitHub

If not already done:
```bash
cd /Volumes/T7/Smart_Sprinkler_PWA/farm-assistant-app
git init
git add .
git commit -m "Initial commit"
git remote add origin YOUR_GITHUB_REPO_URL
git push -u origin main
```

---

## Step 2: Deploy to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. Go to [vercel.com](https://vercel.com) and sign in
2. Click **"Add New"** → **"Project"**
3. Import your GitHub repository
4. **Configure Project:**
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `farm-assistant-app/frontend`
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

5. **Add Environment Variables:**
   Click "Environment Variables" and add these:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://klqvywmnzmrzvaobqded.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_actual_key_here
   NEXT_PUBLIC_APP_URL=https://your-app-name.vercel.app
   NEXT_PUBLIC_API_BASE_URL=https://your-backend.onrender.com/api
   NEXT_PUBLIC_WEATHER_API_KEY=77f8b772e88affb1f644dd32c8c13396
   ```
   
   **Note:** For now, use a placeholder for `NEXT_PUBLIC_API_BASE_URL`. You'll update this after deploying the backend.

6. Click **"Deploy"**

### Option B: Via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Navigate to frontend folder
cd farm-assistant-app/frontend

# Login to Vercel
vercel login

# Deploy
vercel

# For production deployment
vercel --prod
```

---

## Step 3: Post-Deployment

1. **Get your Vercel URL:**
   - Example: `https://your-app-name.vercel.app`

2. **Update Supabase redirect URLs:**
   - Go to Supabase Dashboard → Authentication → URL Configuration
   - Add your Vercel URL to "Site URL" and "Redirect URLs"
   - Format: `https://your-app-name.vercel.app/auth/callback`

3. **Test your deployment:**
   - Visit your Vercel URL
   - Try logging in
   - Check if dashboard loads

---

## Step 4: Update Environment Variables (After Backend Deployment)

Once your backend is deployed on Render:
1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Edit `NEXT_PUBLIC_API_BASE_URL`
3. Set it to your Render backend URL (e.g., `https://your-backend.onrender.com/api`)
4. Redeploy (Vercel → Deployments → Click ⋯ → Redeploy)

---

## Common Issues

### Build Fails
- Check build logs in Vercel dashboard
- Ensure all dependencies are in package.json
- Check for TypeScript errors locally: `npm run build`

### Environment Variables Not Working
- Make sure variable names start with `NEXT_PUBLIC_`
- Redeploy after adding/changing variables
- Check spelling and values

### 404 on Routes
- Ensure Next.js is configured for static export if needed
- Check your pages folder structure

---

## Vercel Dashboard Quick Links

- **Deployments:** See all deployments and logs
- **Settings → Environment Variables:** Manage env vars
- **Settings → Domains:** Add custom domain
- **Analytics:** View performance metrics

---

## Next Steps

After frontend is deployed:
1. ✅ Frontend on Vercel
2. ⏳ Backend on Render (next step)
3. ⏳ ML Service on Render/Hugging Face

---

## Useful Commands

```bash
# Test build locally before deploying
npm run build
npm start

# Check for errors
npm run lint

# Install dependencies
npm install
```

---

**Your frontend should now be live on Vercel!** 🎉

Once deployed, share your Vercel URL and we'll proceed with backend deployment.
