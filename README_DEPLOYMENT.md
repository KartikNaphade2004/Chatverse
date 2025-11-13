# 🚀 Quick Start - Deploy ChatVerse

## ⚡ Fast Deployment (5 Minutes)

### Backend on Render

1. **Create Service:**
   - Go to https://dashboard.render.com
   - New + → Web Service
   - Connect GitHub repo: `KartikNaphade2004/Chatverse`

2. **Settings:**
   ```
   Root Directory: Server
   Start Command: node app.js
   Build Command: npm install
   ```

3. **Environment Variables:**
   ```
   PORT=3000
   NODE_ENV=production
   ALLOWED_ORIGINS=https://chatverse-client.vercel.app
   ```
   (Update ALLOWED_ORIGINS after frontend deploys)

4. **Deploy** → Copy backend URL

---

### Frontend on Vercel

1. **Import Project:**
   - Go to https://vercel.com/dashboard
   - Add New → Project
   - Import `KartikNaphade2004/Chatverse`

2. **Settings:**
   ```
   Root Directory: Client
   Framework: Vite (auto)
   ```

3. **Environment Variable:**
   ```
   VITE_SERVER_URL=https://your-backend-url.onrender.com
   ```
   (Use your actual Render backend URL)

4. **Deploy** → Copy frontend URL

5. **Update Backend CORS:**
   - Go back to Render
   - Update `ALLOWED_ORIGINS` with your Vercel URL
   - Save → Auto-redeploys

---

## ✅ Test

1. Visit your Vercel URL
2. Enter name → Create Room
3. Should see "Connected" ✅
4. Room created successfully!

---

**Full Guide:** See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

