# ChatVerse Deployment Guide

This guide will help you deploy ChatVerse to Vercel (frontend) and keep the backend on Render or another service that supports WebSockets.

## Prerequisites

- GitHub account
- Vercel account (free tier available)
- Render account (or another service for backend - free tier available)
- Node.js installed locally (for testing)

## Project Structure

- **Client/**: React frontend (deploy to Vercel)
- **Server/**: Node.js backend with Socket.IO (deploy to Render/Railway)

## Deployment Steps

### Step 1: Deploy Backend to Render (or keep existing)

If your backend is already deployed on Render at `https://chatverse-backend-1041.onrender.com`, skip this step.

Otherwise:
1. Go to [Render](https://render.com) and sign up/login
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: `chatverse-backend`
   - **Root Directory**: `Server`
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add environment variables in Render dashboard:
   - `PORT=3000`
   - `ALLOWED_ORIGINS=https://your-app.vercel.app` (update after Vercel deployment)
   - `NODE_ENV=production`
6. Deploy and note the backend URL

### Step 2: Update Server CORS Configuration

After getting your Vercel URL, update the backend environment variable:
- Go to Render dashboard → Your service → Environment
- Update `ALLOWED_ORIGINS` to include your Vercel URL:
  ```
  ALLOWED_ORIGINS=http://localhost:5173,https://your-app.vercel.app
  ```
- Redeploy the backend service

### Step 3: Deploy Frontend to Vercel

#### Option A: Deploy via Vercel Dashboard (Recommended)

1. Go to [Vercel](https://vercel.com) and sign up/login with GitHub
2. Click "Add New..." → "Project"
3. Import your GitHub repository: `KartikNaphade2004/Chatverse`
4. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `Client` (click "Edit" and set root directory)
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
5. Add Environment Variable:
   - **Name**: `VITE_SERVER_URL`
   - **Value**: Your backend URL (e.g., `https://chatverse-backend-1041.onrender.com`)
6. Click "Deploy"

#### Option B: Deploy via Vercel CLI

1. Install Vercel CLI:
   ```bash
   npm i -g vercel
   ```

2. Navigate to the Client directory:
   ```bash
   cd Client
   ```

3. Login to Vercel:
   ```bash
   vercel login
   ```

4. Deploy:
   ```bash
   vercel
   ```

5. Set environment variable:
   ```bash
   vercel env add VITE_SERVER_URL
   # Enter your backend URL when prompted
   ```

6. Redeploy:
   ```bash
   vercel --prod
   ```

### Step 4: Update Backend CORS with Vercel URL

After deployment, Vercel will provide you with a URL like `https://chatverse.vercel.app`

1. Go to Render dashboard → Your backend service → Environment
2. Update `ALLOWED_ORIGINS`:
   ```
   ALLOWED_ORIGINS=http://localhost:5173,https://chatverse.vercel.app
   ```
3. Redeploy the backend service

### Step 5: Verify Deployment

1. Visit your Vercel deployment URL
2. Enter a username and join the chat
3. Test messaging functionality
4. Open multiple browser tabs/windows to test real-time messaging

## Environment Variables

### Frontend (Vercel)
- `VITE_SERVER_URL`: Backend server URL (required)

### Backend (Render)
- `PORT`: Server port (default: 3000)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed origins for CORS
- `NODE_ENV`: Environment (production/development)

## Troubleshooting

### CORS Errors
- Ensure your backend `ALLOWED_ORIGINS` includes your Vercel URL
- Check that there's no trailing slash in the CORS configuration
- Verify the backend is running and accessible

### Socket.IO Connection Issues
- Verify the backend URL is correct in Vercel environment variables
- Check that the backend service is running on Render
- Ensure WebSocket support is enabled on Render (usually enabled by default)

### Build Errors on Vercel
- Check that the root directory is set to `Client`
- Verify all dependencies are listed in `package.json`
- Check build logs in Vercel dashboard for specific errors

## Important Notes

1. **WebSocket Support**: Vercel's serverless functions don't support WebSocket connections well. That's why we deploy the backend to Render, which supports persistent connections needed for Socket.IO.

2. **Environment Variables**: Make sure to set `VITE_SERVER_URL` in Vercel dashboard, not in a `.env` file (which won't work in production).

3. **CORS**: The backend must allow your Vercel domain in CORS settings for the frontend to connect.

4. **Free Tier Limitations**:
   - Render free tier services may spin down after inactivity
   - First request after spin-down may be slow
   - Consider upgrading for production use

## Custom Domain (Optional)

### Vercel Custom Domain
1. Go to Vercel dashboard → Your project → Settings → Domains
2. Add your custom domain
3. Follow DNS configuration instructions

### Update Backend CORS
After adding a custom domain, update `ALLOWED_ORIGINS` in Render to include the new domain.

## Support

For issues or questions:
- Check Vercel documentation: https://vercel.com/docs
- Check Render documentation: https://render.com/docs
- Review the project's GitHub repository: https://github.com/KartikNaphade2004/Chatverse

