# Quick Vercel Deployment Guide

## 🚀 Deploy ChatVerse to Vercel

### Prerequisites
- GitHub repository: https://github.com/KartikNaphade2004/Chatverse.git
- Backend already deployed on Render: `https://chatverse-backend-1041.onrender.com`
- Vercel account (sign up at https://vercel.com)

### Step 1: Deploy Frontend to Vercel

#### Via Vercel Dashboard (Easiest Method):

1. **Go to Vercel Dashboard**
   - Visit https://vercel.com
   - Sign in with GitHub

2. **Import Project**
   - Click "Add New..." → "Project"
   - Import `KartikNaphade2004/Chatverse`

3. **Configure Project**
   - **Framework Preset**: Vite (auto-detected)
   - **Root Directory**: `Client` (IMPORTANT: Change from root to Client)
   - **Build Command**: `npm run build` (auto-filled)
   - **Output Directory**: `dist` (auto-filled)
   - **Install Command**: `npm install` (auto-filled)

4. **Add Environment Variable**
   - Click "Environment Variables"
   - Add new variable:
     - **Key**: `VITE_SERVER_URL`
     - **Value**: `https://chatverse-backend-1041.onrender.com`
   - Make sure it's added for Production, Preview, and Development

5. **Deploy**
   - Click "Deploy"
   - Wait for deployment to complete
   - Vercel will provide you with a URL like `https://chatverse.vercel.app`

### Step 2: Update Backend CORS

After Vercel deployment, you'll get a URL. Update your backend CORS settings:

1. **Go to Render Dashboard**
   - Visit https://render.com
   - Go to your backend service

2. **Update Environment Variables**
   - Go to "Environment" tab
   - Add or update `ALLOWED_ORIGINS`:
     ```
     ALLOWED_ORIGINS=http://localhost:5173,https://your-vercel-url.vercel.app
     ```
   - Replace `your-vercel-url.vercel.app` with your actual Vercel URL

3. **Redeploy Backend**
   - Save the environment variable
   - Render will automatically redeploy

### Step 3: Verify Deployment

1. Visit your Vercel URL
2. Enter a username and join the chat
3. Test the messaging functionality
4. Open multiple tabs to test real-time features

## 📝 Important Notes

- **Root Directory**: Make sure to set root directory to `Client` in Vercel settings
- **Environment Variable**: `VITE_SERVER_URL` must be set in Vercel, not in a local `.env` file
- **CORS**: Backend must allow your Vercel domain
- **WebSocket Support**: Backend needs to stay on Render (or similar service) as Vercel doesn't support WebSockets well

## 🔧 Troubleshooting

### Build Fails
- Check that root directory is set to `Client`
- Verify all dependencies in `package.json`
- Check build logs in Vercel dashboard

### CORS Errors
- Verify `ALLOWED_ORIGINS` in Render includes your Vercel URL
- Check that backend is running
- Ensure no trailing slashes in URLs

### Socket.IO Not Connecting
- Verify `VITE_SERVER_URL` is set correctly in Vercel
- Check backend URL is accessible
- Verify WebSocket support on backend service

## 📚 Additional Resources

- Vercel Documentation: https://vercel.com/docs
- Render Documentation: https://render.com/docs
- Full deployment guide: See `DEPLOYMENT.md`

## 🎉 After Deployment

Your app will be live at: `https://your-vercel-url.vercel.app`

Share this URL with others to test the chat application!

