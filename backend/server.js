require('dotenv').config();
const https = require('https');
const http = require('http');
const fs = require('fs');
const crypto = require('crypto');
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
const corsOrigin = process.env.NODE_ENV === 'production'
  ? process.env.CLIENT_URL || true  // En production, accepte tout (même origin)
  : process.env.CLIENT_URL || 'http://localhost:5173';

app.use(cors({
  origin: corsOrigin,
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// ── HSTS : force HTTPS pour les futures requêtes (production uniquement) ───────
if (isProd) {
  app.use((req, res, next) => {
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });
}

// ── Routes API ────────────────────────────────────────────────────────────────
app.use('/api', authRoutes);
app.use('/api', boardRoutes);
app.use('/api', postitRoutes);
app.use('/api/admin', adminRoutes);

// ── Static Files (Frontend) ────────────────────────────────────────────────────
const path = require('path');
const frontendDistPath = path.join(__dirname, '../frontend/dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  // SPA fallback: toutes les routes non-API redirigent vers index.html (React Router)
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
}

// ── Démarrage après connexion DB ───────────────────────────────────────────────
connectDB().then(async () => {
  await seedDefaults();

  const keyPath = process.env.SSL_KEY_PATH || './certs/key.pem';
  const certPath = process.env.SSL_CERT_PATH || './certs/cert.pem';

  if (fs.existsSync(keyPath) && fs.existsSync(certPath)) {
    // Alerte si le certificat expire dans moins de 30 jours
    try {
      const certData = fs.readFileSync(certPath);
      const x509 = new crypto.X509Certificate(certData);
      const daysLeft = Math.floor((new Date(x509.validTo) - Date.now()) / 86_400_000);
      if (daysLeft < 30)
        console.warn(`⚠️  Certificat SSL expire dans ${daysLeft} jour(s) — renouvellement requis`);
      else
        console.log(`Certificat SSL valide encore ${daysLeft} jour(s) (expire le ${x509.validTo})`);
    } catch (e) {
      console.warn('Impossible de lire la date d\'expiration du certificat :', e.message);
    }

    const credentials = {
      key: fs.readFileSync(keyPath),
      cert: fs.readFileSync(certPath),
      minVersion: 'TLSv1.2',
    };
    const httpsServer = https.createServer(credentials, app);
    initSocket(httpsServer);
    const httpsPort = process.env.HTTPS_PORT || 3443;
    httpsServer.listen(httpsPort, () =>
      console.log(`Serveur HTTPS démarré → https://localhost:${httpsPort}`)
    );

    // Redirection HTTP → HTTPS (production uniquement)
    if (isProd) {
      const httpPort = process.env.PORT || 3001;
      http.createServer((req, res) => {
        const host = req.headers.host?.replace(/:\d+$/, '');
        res.writeHead(301, { Location: `https://${host}:${httpsPort}${req.url}` });
        res.end();
      }).listen(httpPort, () =>
        console.log(`Redirection HTTP → HTTPS active sur le port ${httpPort}`)
      );
    }

  } else {
    console.warn(
      isProd
        ? 'Certificats SSL introuvables. Le serveur démarre en HTTP (HTTPS géré par le reverse proxy Railway).'
        : 'Certificats SSL introuvables — démarrage en HTTP (développement)'
    );
    const httpServer = http.createServer(app);
    initSocket(httpServer);
    const port = process.env.PORT || 3001;
    httpServer.listen(port, () =>
      console.log(`Serveur HTTP démarré → http://localhost:${port}`)
    );
  }
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
