# 🚀 ChatVerse Setup Guide

This guide will help you get ChatVerse running locally and deploy it to production.

## 📋 Prerequisites

- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Git** - [Download](https://git-scm.com/)

## 🏃 Quick Start (Local Development)

### 1. Clone the Repository

```bash
git clone https://github.com/KartikNaphade2004/Chatverse.git
cd ChatVerse-main
```

### 2. Install Dependencies

**Backend:**
```bash
cd Server
npm install
```

**Frontend:**
```bash
cd ../Client
npm install
```

### 3. Configure Environment Variables

**Backend (`Server/.env`):**
```env
PORT=3000
ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
NODE_ENV=development
```

**Frontend (`Client/.env`):**
```env
VITE_SERVER_URL=http://localhost:3000
```

> 💡 **Tip:** Copy `.env.example` files and rename them to `.env` if they exist.

### 4. Run the Application

**Terminal 1 - Start Backend:**
```bash
cd Server
npm start
```
Backend will run on `http://localhost:3000`

**Terminal 2 - Start Frontend:**
```bash
cd Client
npm run dev
```
Frontend will run on `http://localhost:5173`

### 5. Open in Browser

Navigate to `http://localhost:5173` and start chatting! 🎉

---

## ☁️ Production Deployment

### Backend Deployment (Render)

1. **Create a Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create New Web Service**
   - Click **New +** → **Web Service**
   - Connect your GitHub repository
   - Select the `Chatverse` repository

3. **Configure Service Settings**
   - **Name:** `chatverse-backend` (or your choice)
   - **Root Directory:** `Server`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `node app.js`
   - **Instance Type:** Free tier is fine for testing

4. **Set Environment Variables**
   ```
   PORT=3000
   NODE_ENV=production
   ALLOWED_ORIGINS=https://your-frontend-url.vercel.app,https://chatverse.vercel.app
   ```

5. **Deploy!**
   - Click **Create Web Service**
   - Wait for deployment to complete
   - Copy your backend URL (e.g., `https://chatverse-backend-01hn.onrender.com`)

### Frontend Deployment (Vercel)

1. **Create a Vercel Account**
   - Go to [vercel.com](https://vercel.com)
   - Sign up with GitHub

2. **Import Project**
   - Click **Add New** → **Project**
   - Import your `Chatverse` repository
   - Set **Root Directory** to `Client`

3. **Configure Environment Variables**
   ```
   VITE_SERVER_URL=https://chatverse-backend-01hn.onrender.com
   ```
   (Use your actual Render backend URL)

4. **Deploy!**
   - Click **Deploy**
   - Wait for deployment
   - Your app will be live! 🚀

---

## 🔧 Troubleshooting

### Backend won't start
- ✅ Check that `PORT` is set in `.env`
- ✅ Ensure `node app.js` is the start command (not `node server.js`)
- ✅ Verify all dependencies are installed: `npm install`

### Frontend can't connect to backend
- ✅ Check `VITE_SERVER_URL` matches your backend URL
- ✅ Verify backend is running and accessible
- ✅ Check CORS settings in backend `ALLOWED_ORIGINS`

### Room creation fails
- ✅ Check browser console for errors
- ✅ Verify Socket.IO connection (should see "Connected" status)
- ✅ Ensure backend is deployed and running

### Render deployment fails
- ✅ Check that Root Directory is set to `Server`
- ✅ Verify Start Command is `node app.js`
- ✅ Check build logs for specific errors

---

## 📝 Environment Variables Reference

### Backend (Server/.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `ALLOWED_ORIGINS` | Comma-separated frontend URLs | `http://localhost:5173,https://chatverse.vercel.app` |
| `NODE_ENV` | Environment mode | `development` or `production` |

### Frontend (Client/.env)
| Variable | Description | Example |
|----------|-------------|---------|
| `VITE_SERVER_URL` | Backend server URL | `http://localhost:3000` or `https://chatverse-backend-01hn.onrender.com` |

---

## 🎯 Next Steps

- ✅ Test room creation
- ✅ Test joining rooms
- ✅ Test real-time messaging
- ✅ Customize the UI
- ✅ Add new features!

---

**Need Help?** Open an issue on [GitHub](https://github.com/KartikNaphade2004/Chatverse/issues)

