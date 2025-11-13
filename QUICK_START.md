# ⚡ ChatVerse Quick Start

Get ChatVerse running in 5 minutes!

## 🚀 Local Development

### 1. Install Dependencies

```bash
# Backend
cd Server
npm install

# Frontend  
cd ../Client
npm install
```

### 2. Create Environment Files

**Server/.env:**
```env
PORT=3000
ALLOWED_ORIGINS=http://localhost:5173
NODE_ENV=development
```

**Client/.env:**
```env
VITE_SERVER_URL=http://localhost:3000
```

### 3. Run Both Servers

**Terminal 1 (Backend):**
```bash
cd Server
npm start
```

**Terminal 2 (Frontend):**
```bash
cd Client
npm run dev
```

### 4. Open Browser

Visit: `http://localhost:5173` 🎉

---

## ☁️ Production URLs

- **Frontend:** https://chatverse-3k62u031u-kartik-naphades-projects.vercel.app
- **Backend:** https://chatverse-backend-01hn.onrender.com

---

## ✅ Verify It's Working

1. Enter your name on the welcome screen
2. Click "Create Room"
3. Enter a room name
4. You should see "Connected" status
5. Room should be created successfully!

---

**Need more details?** See [SETUP.md](./SETUP.md) for complete instructions.

