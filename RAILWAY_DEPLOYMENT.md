# Railway Deployment Configuration

## Environment Variables to Set in Railway:

```
NODE_ENV=production
PORT=3000
MONGO_URI=mongodb+srv://username:password@cluster.mongodb.net/social-postit?retryWrites=true&w=majority
JWT_SECRET=your_secret_key_min_32_characters_long
CLIENT_URL=https://your-railway-app-url.railway.app
```

## Important Notes:

1. **MongoDB Setup**: You can use:
   - Railway's built-in MongoDB service, or
   - MongoDB Atlas (recommended for free tier)
   - Connection string should be set in `MONGO_URI`

2. **JWT_SECRET**: Generate a secure random string (min 32 characters)
   - Command: `openssl rand -hex 32`

3. **CLIENT_URL**: Will be your Railway app's public URL
   - Format: `https://your-app-name.railway.app`

4. **Build Process**: Railway will automatically:
   - Install dependencies: `npm install`
   - Build frontend: `npm run build:frontend`
   - Start server: `npm start`

## Procfile (optional, Railway auto-detects)
```
web: npm start
```

## What's Been Changed:

✅ Removed SSL certificate requirement
✅ Backend now serves built frontend files in production
✅ Port configuration uses Railway's PORT environment variable
✅ Socket.IO configured for HTTP (Railway handles HTTPS at edge)
✅ Added root package.json for coordinated builds
✅ Frontend build integrated into deployment process
