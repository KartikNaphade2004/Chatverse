# 🔧 Render Internal Server Error - Fix Guide

## Common Causes & Solutions

### 1. Check Render Service Settings

Go to your Render dashboard → Your service → Settings:

**Required Settings:**
- **Root Directory:** `Server` (must be exactly this)
- **Start Command:** `node app.js` (NOT `node server.js`)
- **Build Command:** `npm install` (or leave empty)
- **Environment:** `Node`

### 2. Environment Variables

In Render → Environment tab, add:

```
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=https://chatverse-client.vercel.app,https://chatverse.vercel.app
```

### 3. Check Build Logs

1. Go to Render dashboard
2. Click on your service
3. Click "Logs" tab
4. Look for errors like:
   - "Cannot find module"
   - "Port already in use"
   - "EADDRINUSE"

### 4. Common Fixes

**If you see "Cannot find module /opt/render/project/src/Server/server.js":**
- ✅ Start Command must be: `node app.js`
- ✅ Root Directory must be: `Server`

**If you see "Port already in use":**
- ✅ Use `PORT` environment variable (Render sets this automatically)
- ✅ Don't hardcode port 3000

**If you see CORS errors:**
- ✅ Add your Vercel URL to `ALLOWED_ORIGINS`
- ✅ Format: `https://chatverse-client.vercel.app,https://chatverse.vercel.app`

### 5. Manual Redeploy

1. Go to Render dashboard
2. Click your service
3. Click "Manual Deploy" → "Deploy latest commit"
4. Watch the logs for errors

### 6. Test Backend

Once deployed, test:
```
https://chatverse-backend-01hn.onrender.com/
```

Should return: `server working`

---

## Quick Checklist

- [ ] Root Directory = `Server`
- [ ] Start Command = `node app.js`
- [ ] Environment variables set
- [ ] Build logs show no errors
- [ ] Server responds at root URL

