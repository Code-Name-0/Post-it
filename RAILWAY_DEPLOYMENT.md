# Deployment Guide - Railway

## Overview
This setup deploys the entire Post-it application (backend + frontend) as a **single service** on Railway.

## Architecture
- **Backend**: Express.js (Node.js)
- **Frontend**: React + Vite (built into `dist/` folder)
- **Serving**: Backend serves frontend as static files + API routes
- **Database**: MongoDB Atlas (cloud-hosted)

## Step-by-Step Deployment

### 1. Prepare MongoDB Atlas
1. Create free account: [mongodb.com/cloud/atlas](https://mongodb.com/cloud/atlas)
2. Create a free cluster (M0 tier)
3. Create a database user with a password
4. Get the connection string (looks like: `mongodb+srv://user:pass@cluster.mongodb.net/social-postit`)
5. 
mongodb+srv://root:<root>@cluster0.nsnausg.mongodb.net/?appName=Cluster0

### 2. Create Railway Project
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Create new project → "Deploy from GitHub repo"
4. Select your Post-it repo

### 3. Configure Environment Variables in Railway
In Railway dashboard → Variables, add:

```
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/social-postit
JWT_SECRET=your-secret-min-32-chars (generate: openssl rand -hex 32)
NODE_ENV=production
```

(Leave `CLIENT_URL` empty - it will default to the Railway domain)

### 4. Configure Build Settings in Railway

Railway will automatically detect your `package.json` and use:

- **Build Command**: `npm run build` (automatically from root package.json)
- **Start Command**: `npm start` (automatically from root package.json)

This runs:
```bash
# Build phase
npm install --prefix frontend && npm run build --prefix frontend && npm install --prefix backend

# Start phase  
npm start --prefix backend  (starts Express on PORT)
```

No additional configuration needed!

### 5. Deploy
Push to GitHub:
```bash
git add .
git commit -m "Setup for Railway deployment"
git push origin main
```

Railway automatically deploys on GitHub push.

## How It Works

### Build Process
1. Railway executes `npm run build`
2. This runs `build.js` (Node.js script with better error handling)
3. build.js installs frontend dependencies and builds to `frontend/dist/`
4. build.js installs backend dependencies
5. Frontend is ready to be served as static files

### Runtime
1. Railway runs `npm start` (starts backend)
2. Backend server listens on `process.env.PORT` (Railway assigns dynamic port)
3. Backend serves:
   - API routes at `/api/*`
   - Frontend static files at all other paths
   - Socket.IO at `/socket.io`

## Verification

Once deployed, check:
- ✅ Frontend loads at `https://your-railway-domain.up.railway.app/`
- ✅ API works at `/api/boards`, `/api/me`, etc.
- ✅ Real-time updates (Socket.IO) work
- ✅ Login/signup creates users in MongoDB
- ✅ Admin page accessible for admin users

## Troubleshooting

### Deployment fails
- Check Railway logs: Dashboard → Deployments → View Logs
- Verify `MONGO_URI` is correct and accessible
- Ensure MongoDB Atlas IP whitelist includes Railway (should be `0.0.0.0/0`)

### Frontend not loading
- Verify `frontend/dist/` is built (check build logs)
- Check that `server.js` correctly serves static files
- Browser console: check `/api/me` response

### API calls return 500
- Check MongoDB connection string in logs
- Verify `JWT_SECRET` is set
- Check `NODE_ENV=production` is set

## Architecture Diagram

```
┌─ Railway Platform ─────────────────────┐
│                                        │
│  Port $PORT (Dynamic)                  │
│         │                              │
│    ┌────▼──────────────────────┐      │
│    │  Express Backend           │      │
│    ├────────────────────────────┤      │
│    │ ✓ API Routes (/api/*)      │      │
│    │ ✓ Socket.IO (/socket.io)   │      │
│    │ ✓ Static Files (frontend)  │      │
│    │ ✓ JWT Auth (cookies)       │      │
│    └────────┬───────────────────┘      │
│             │                          │
│    ┌────────▼──────────────────┐      │
│    │  MongoDB Atlas             │      │
│    │  (Cloud Database)          │      │
│    └───────────────────────────┘      │
│                                        │
└────────────────────────────────────────┘
```

## Local Development (unchanged)

```bash
# Terminal 1: Backend
cd backend
npm install
npm run dev          # Runs on localhost:3001

# Terminal 2: Frontend
cd frontend
npm install
npm run dev          # Runs on localhost:5173
# Vite proxy redirects /api and /socket.io to localhost:3001
```

## Production Notes

- **HTTPS**: Handled by Railway's reverse proxy automatically
- **HSTS**: Enabled via `Strict-Transport-Security` header
- **Cookies**: HTTP-only and secure flag set automatically in production
- **CORS**: Configured to accept same-origin requests
- **Certificates**: Not needed on Railway (uses platform SSL)

---

For questions or issues, check Railway's [documentation](https://docs.railway.app).
