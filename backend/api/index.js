require('dotenv').config();
const express      = require('express');
const cors         = require('cors');
const cookieParser = require('cookie-parser');
const helmet       = require('helmet');

const connectDB    = require('../db');
const authRoutes   = require('../routes/authRoutes');
const boardRoutes  = require('../routes/boardRoutes');
const postitRoutes = require('../routes/postitRoutes');
const adminRoutes  = require('../routes/adminRoutes');

const app = express();

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use((req, res, next) => {
  res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
  next();
});

app.use('/api', authRoutes);
app.use('/api', boardRoutes);
app.use('/api', postitRoutes);
app.use('/api/admin', adminRoutes);

// Connexion DB + seed au démarrage à froid
connectDB().then(async () => {
  const Board  = require('../models/Board');
  const User   = require('../models/User');
  const bcrypt = require('bcrypt');

  if (!(await Board.findOne({ slug: 'default' })))
    await Board.create({ slug: 'default', name: 'Tableau principal' });

  if (!(await User.findOne({ username: 'guest' }))) {
    const hashed = await bcrypt.hash('guest_system_account', 12);
    await User.create({ username: 'guest', password: hashed, role: 'guest' });
  }
});

module.exports = app;
