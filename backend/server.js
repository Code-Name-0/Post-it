require('dotenv').config();
const path = require('path');
const http = require('http');
const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');

const connectDB = require('./db');
const { initSocket } = require('./socket');

const authRoutes = require('./routes/authRoutes');
const boardRoutes = require('./routes/boardRoutes');
const postitRoutes = require('./routes/postitRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const isProd = process.env.NODE_ENV === 'production';

// ── Sécurité des headers HTTP ──────────────────────────────────────────────────
app.use(helmet());

// ── CORS strict : autorise uniquement le frontend avec cookies ─────────────────
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// ── Serve static frontend files (production) ───────────────────────────────────
if (isProd) {
  const frontendBuild = path.join(__dirname, '../frontend/dist');
  console.log(`📁 Looking for frontend build at: ${frontendBuild}`);
  
  const fs = require('fs');
  if (fs.existsSync(frontendBuild)) {
    console.log(`✅ Frontend dist folder found!`);
    app.use(express.static(frontendBuild));

    // Serve index.html for React Router
    app.get('*', (req, res, next) => {
      // Don't intercept API routes
      if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
        return next();
      }
      res.sendFile(path.join(frontendBuild, 'index.html'));
    });
  } else {
    console.error(`❌ ERROR: Frontend dist folder NOT found at ${frontendBuild}`);
    console.log(`   This means the frontend build failed or wasn't copied.`);
  }
}

// ── HSTS : force HTTPS pour les futures requêtes (production uniquement) ───────
if (isProd) {
  app.use((req, res, next) => {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });
}

// ── Routes ─────────────────────────────────────────────────────────────────────
app.use('/api', authRoutes);
app.use('/api', boardRoutes);
app.use('/api', postitRoutes);
app.use('/api/admin', adminRoutes);

// ── Démarrage après connexion DB ───────────────────────────────────────────────
connectDB().then(async () => {
  await seedDefaults();

  // Railway provides the PORT environment variable
  // HTTPS is handled by Railway's load balancer
  const port = process.env.PORT || 3001;
  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${port}`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  });
});

async function seedDefaults() {
  const Board = require('./models/Board');
  const User = require('./models/User');
  const bcrypt = require('bcrypt');

  if (!(await Board.findOne({ slug: 'default' }))) {
    await Board.create({ slug: 'default', name: 'Tableau principal' });
    console.log('Seed : board "default" créé');
  }

  if (!(await User.findOne({ username: 'guest' }))) {
    const hashed = await bcrypt.hash('guest_system_account', 12);
    await User.create({ username: 'guest', password: hashed, role: 'guest' });
    console.log('Seed : utilisateur "guest" créé');
  }
}
