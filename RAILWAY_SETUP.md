# 🚀 Railway Deployment Guide

## What Has Been Changed

Your Post-it application has been updated to be compatible with Railway deployment. Here's what was modified:

### Backend Changes (`backend/`)

1. **Removed SSL Certificate Handling**
   - ❌ No more local certificate requirement (`certs/key.pem`, `certs/cert.pem`)
   - Railway handles HTTPS at the edge load balancer
   - Server now runs on simple HTTP

2. **Port Configuration**
   - Now uses Railway's `PORT` environment variable
   - Listens on `0.0.0.0` to accept Railway's proxied connections
   - Default fallback: 3001 (for local development)

3. **Frontend Serving**
   - Backend now serves the built frontend in production
   - React Router integration: all non-API routes serve `index.html`

4. **Cookie Security**
   - `secure` flag only enabled in production (Railway handles HTTPS)
   - Allows development over HTTP, production over HTTPS

### Frontend Changes (`frontend/`)

1. **Vite Configuration**
   - Removed SSL certificate references
   - Updated proxy to use HTTP endpoints
   - WebSocket proxy for Socket.IO

2. **Build Integration**
   - Frontend must be built before deployment
   - Built files served by backend from `frontend/dist/`

### Root Level Changes

1. **Created `package.json`**
   - Coordinates installation and building of both packages
   - Scripts for development and production builds

2. **Created `Procfile`**
   - Tells Railway how to start the application
   - Command: `npm start`

3. **Configuration Files**
   - `RAILWAY_DEPLOYMENT.md` - Detailed environment setup
   - `.env.production.example` - Production environment template
   - `.gitignore` - Proper git ignore rules

## Railway Deployment Steps

### 1. Prepare Your Repository
```bash
# Ensure all changes are committed
git add .
git commit -m "Update for Railway deployment"
git push origin main
```

### 2. Create Railway Project
- Go to [railway.app](https://railway.app)
- Create a new project
- Connect your GitHub repository

### 3. Configure Database
**Option A: Railway's PostgreSQL/MongoDB**
- Add a PostgreSQL or MongoDB service from Railway marketplace
- Railway will provide `DATABASE_URL` automatically

**Option B: MongoDB Atlas (Recommended for Free Tier)**
1. Create account at [mongodb.com](https://mongodb.com)
2. Create a free cluster
3. Get connection string: `mongodb+srv://username:password@cluster.mongodb.net/social-postit?retryWrites=true&w=majority`

### 4. Set Environment Variables
In Railway dashboard, set these variables:

```
NODE_ENV=production
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/social-postit?retryWrites=true&w=majority
JWT_SECRET=<your-secure-32-char-secret>
CLIENT_URL=https://your-app-name.railway.app
```

**Generate JWT_SECRET:**
```bash
openssl rand -hex 32
```

### 5. Deploy
- Push code to GitHub
- Railway will automatically:
  1. Install dependencies: `npm install` (installs backend & frontend deps)
  2. Build frontend: `npm run build:frontend`
  3. Start server: `npm start`

### 6. Verify Deployment
- Check Railway logs for errors
- Visit your app URL: `https://your-app-name.railway.app`
- Test API endpoints: `https://your-app-name.railway.app/api`
- Test WebSocket: Socket.IO should connect automatically

## Important Notes

### SSL/HTTPS
- ✅ Railway automatically handles HTTPS with valid certificates
- ✅ No need to manage certificates in your code
- ✅ All connections to clients are encrypted
- ℹ️ Internal connection (Railway → Node app) is HTTP

### Port Binding
- ✅ Must use `process.env.PORT` (Railway sets this)
- ✅ Default: 3000 (configurable)
- ℹ️ Never hardcode ports in production code

### Environment Variables
- Create a `.env` file locally (not committed to git)
- Use `.env.production.example` as a reference
- Railway dashboard sets production variables

### Frontend Build
- Frontend **must** be built before production
- Built files are in `frontend/dist/`
- Backend serves these files in production
- Development: Vite dev server runs separately with proxy

## Troubleshooting

### 500 Errors / MongoDB Connection
- Check `MONGO_URI` is correct
- Ensure IP whitelist allows Railway's IPs (use 0.0.0.0/0 or Railway's IP range)
- Check database credentials

### 404 on Routes
- Ensure frontend is built: `npm run build:frontend`
- Check `frontend/dist/index.html` exists
- Verify `NODE_ENV=production` is set

### WebSocket Connection Issues
- Check `CLIENT_URL` matches your Railway app domain
- Ensure Socket.IO is configured with correct CORS origin
- Verify firewall allows WebSocket connections

### Build Failures
- Check logs in Railway dashboard
- Ensure both `backend/package.json` and `frontend/package.json` are valid
- Node version should be 18+ (Railway default is fine)

## Local Development

### Setup
```bash
npm install:all  # Install all dependencies
npm run dev      # Run both backend and frontend
```

### Environment
Create `backend/.env`:
```
NODE_ENV=development
PORT=3001
MONGO_URI=mongodb://localhost:27017/social-postit
JWT_SECRET=dev-secret-key
CLIENT_URL=http://localhost:5173
```

## Additional Resources

- [Railway Documentation](https://docs.railway.app)
- [Node.js on Railway](https://docs.railway.app/guides/nodejs)
- [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
- [Socket.IO CORS Guide](https://socket.io/docs/v4/handling-cors/)

---

**Last Updated:** April 2026
