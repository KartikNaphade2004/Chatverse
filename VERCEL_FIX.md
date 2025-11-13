# 🔧 Vercel Deployment Fix Guide

## Common Issues & Solutions

### 1. Check Project Settings

Go to Vercel dashboard → Your project → Settings:

**Required Settings:**
- **Root Directory:** `Client` (must be exactly this)
- **Framework Preset:** `Vite` (auto-detected)
- **Build Command:** `npm run build`
- **Output Directory:** `dist`
- **Install Command:** `npm install`

### 2. Environment Variables

In Vercel → Settings → Environment Variables, add:

```
VITE_SERVER_URL=https://chatverse-backend-01hn.onrender.com
```

**Important:** 
- Variable name must start with `VITE_` for Vite to read it
- Redeploy after adding environment variables

### 3. Check Deployment Logs

1. Go to Vercel dashboard
2. Click your project
3. Click "Deployments"
4. Click on latest deployment
5. Check "Build Logs" for errors

### 4. Common Build Errors

**"Module not found":**
- ✅ Run `npm install` locally first
- ✅ Check `package.json` has all dependencies

**"Build failed":**
- ✅ Check Node.js version (should be 18+)
- ✅ Verify `vite.config.js` exists

**"Environment variable not found":**
- ✅ Variable name must start with `VITE_`
- ✅ Redeploy after adding variables

### 5. Manual Redeploy

1. Go to Vercel dashboard
2. Click your project
3. Click "Deployments"
4. Click "..." on latest deployment
5. Click "Redeploy"

Or use CLI:
```bash
cd Client
vercel --prod
```

### 6. Link Project (if needed)

If project not linked:
```bash
cd Client
vercel link
# Follow prompts to select project
vercel --prod
```

---

## Quick Checklist

- [ ] Root Directory = `Client`
- [ ] Environment variable `VITE_SERVER_URL` set
- [ ] Build completes without errors
- [ ] Deployment shows "Ready" status
- [ ] Site loads at your Vercel URL

