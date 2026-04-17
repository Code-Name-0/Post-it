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

app.use(helmet());

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

if (isProd) {
  console.log('📱 Backend API only - Frontend deployed separately');
}

if (isProd) {
  app.use((req, res, next) => {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });
}

app.use('/api', authRoutes);
app.use('/api', boardRoutes);
app.use('/api', postitRoutes);
app.use('/api/admin', adminRoutes);

connectDB().then(async () => {
  await seedDefaults();
  startServer();
}).catch(err => {
  console.error('⚠️  MongoDB connection failed, but starting server anyway to serve frontend...');
  console.error('Database error:', err.message);
  startServer();
});

function startServer() {
  const port = process.env.PORT || 3001;
  const httpServer = http.createServer(app);
  initSocket(httpServer);

  httpServer.listen(port, '0.0.0.0', () => {
    console.log(`✅ Server running on port ${port}`);
    console.log(`NODE_ENV: ${process.env.NODE_ENV || 'development'}`);
  });
}

async function seedDefaults() {
  try {
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
  } catch (err) {
    console.error('⚠️  Could not seed defaults:', err.message);
  }
}
