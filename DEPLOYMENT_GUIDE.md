# 🚀 Complete Deployment Guide - ChatVerse

## 📋 Prerequisites

- GitHub account
- Render account (for backend) - https://render.com
- Vercel account (for frontend) - https://vercel.com

---

## 🔧 Step 1: Backend Deployment (Render)

### 1.1 Create New Web Service on Render

1. Go to https://dashboard.render.com
2. Click **New +** → **Web Service**
3. Connect your GitHub account if not already connected
4. Select repository: `KartikNaphade2004/Chatverse`
5. Click **Connect**

### 1.2 Configure Service Settings

Fill in these **exact** settings:

| Setting | Value |
|---------|-------|
| **Name** | `chatverse-backend` |
| **Region** | Choose closest to you |
| **Branch** | `main` |
| **Root Directory** | `Server` ⚠️ **MUST BE EXACTLY THIS** |
| **Environment** | `Node` |
| **Build Command** | `npm install` |
| **Start Command** | `node app.js` ⚠️ **MUST BE EXACTLY THIS** |
| **Instance Type** | Free (or paid if you prefer) |

### 1.3 Set Environment Variables

Click **Environment** tab and add:

```
PORT=3000
NODE_ENV=production
ALLOWED_ORIGINS=https://chatverse-client.vercel.app,https://chatverse.vercel.app
```

**Important:** Replace with your actual Vercel URLs after frontend deployment.

### 1.4 Deploy

1. Click **Create Web Service**
2. Wait for deployment (2-3 minutes)
3. Check logs - should see: `Server is running on port 3000`
4. Copy your backend URL (e.g., `https://chatverse-backend-xxxxx.onrender.com`)

### 1.5 Test Backend

Visit your backend URL in browser:
```
https://chatverse-backend-xxxxx.onrender.com/
```

Should return: `server working`

---

## 🎨 Step 2: Frontend Deployment (Vercel)

### 2.1 Import Project to Vercel

1. Go to https://vercel.com/dashboard
2. Click **Add New** → **Project**
3. Import Git Repository: `KartikNaphade2004/Chatverse`
4. Click **Import**

### 2.2 Configure Project Settings

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Vite` (auto-detected) |
| **Root Directory** | `Client` ⚠️ **MUST BE EXACTLY THIS** |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### 2.3 Set Environment Variables

Before deploying, click **Environment Variables** and add:

```
VITE_SERVER_URL=https://chatverse-backend-xxxxx.onrender.com
```

⚠️ **Replace `xxxxx` with your actual Render backend URL from Step 1.4**

### 2.4 Deploy

1. Click **Deploy**
2. Wait for build to complete (1-2 minutes)
3. Copy your frontend URL (e.g., `https://chatverse-client.vercel.app`)

### 2.5 Update Backend CORS (Important!)

After getting your Vercel URL, go back to Render:

1. Open your backend service
2. Go to **Environment** tab
3. Update `ALLOWED_ORIGINS`:
   ```
   ALLOWED_ORIGINS=https://your-actual-vercel-url.vercel.app
   ```
4. Click **Save Changes**
5. Service will auto-redeploy

---

## ✅ Step 3: Verify Everything Works

### Test Checklist

1. **Backend Health Check**
   - Visit: `https://your-backend-url.onrender.com/`
   - Should see: `server working`

2. **Frontend Loads**
   - Visit: `https://your-frontend-url.vercel.app`
   - Should see ChatVerse welcome screen

3. **Create Room**
   - Enter your name
   - Click "Create Room"
   - Enter room name
   - Connection status should show "Connected" ✅
   - Room should be created successfully

4. **Real-time Chat**
   - Open two browser windows
   - Join the same room
   - Send messages - should appear instantly in both windows

---

## 🔄 Updating Deployments

### After Code Changes

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Your changes"
   git push origin main
   ```

2. **Render (Backend):**
   - Auto-deploys from `main` branch
   - Or manually: Dashboard → Your Service → Manual Deploy

3. **Vercel (Frontend):**
   - Auto-deploys from `main` branch
   - Or manually: Dashboard → Your Project → Deployments → Redeploy

---

## 🐛 Troubleshooting

### Backend Issues

**"Cannot find module /opt/render/project/src/Server/server.js"**
- ✅ Check: Root Directory = `Server`
- ✅ Check: Start Command = `node app.js` (NOT `node server.js`)

**"Internal Server Error"**
- ✅ Check Render logs for specific error
- ✅ Verify all environment variables are set
- ✅ Check that `npm install` completed successfully

**"Not allowed by CORS"**
- ✅ Add your Vercel URL to `ALLOWED_ORIGINS` in Render
- ✅ Format: `https://your-url.vercel.app` (no trailing slash)
- ✅ Redeploy after updating environment variables

### Frontend Issues

**"Failed to fetch" or "Connection refused"**
- ✅ Check `VITE_SERVER_URL` matches your Render backend URL
- ✅ Verify backend is running (visit backend URL in browser)
- ✅ Check browser console for specific errors

**"Build failed"**
- ✅ Check Vercel build logs
- ✅ Verify all dependencies in `package.json`
- ✅ Try running `npm install` locally first

---

## 📝 Quick Reference

### Backend (Render)
- **URL Format:** `https://chatverse-backend-xxxxx.onrender.com`
- **Health Check:** `https://your-backend-url.onrender.com/`
- **Logs:** Render Dashboard → Your Service → Logs

### Frontend (Vercel)
- **URL Format:** `https://chatverse-client.vercel.app` or `https://chatverse-xxxxx.vercel.app`
- **Logs:** Vercel Dashboard → Your Project → Deployments → Build Logs

---

## 🎉 Success!

Once everything is deployed and working:
- ✅ Backend running on Render
- ✅ Frontend running on Vercel
- ✅ CORS configured correctly
- ✅ Real-time chat working

Your ChatVerse application is now live! 🚀

---

**Need Help?** Check the logs on both platforms for specific error messages.

