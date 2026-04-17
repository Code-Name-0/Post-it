const jwt  = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Peuple req.user si un token JWT valide est présent dans le cookie HTTP-only.
 * N'échoue pas : les routes publiques reçoivent req.user = null.
 */
const authenticate = async (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    req.user = null;
    return next();
  }
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // On charge l'utilisateur frais depuis la DB (rôle potentiellement mis à jour)
    req.user = await User.findById(decoded.id).select('-password');
    if (!req.user) {
      // Utilisateur supprimé entre deux connexions
      res.clearCookie('token');
    }
  } catch {
    // Token invalide ou expiré — traité comme non connecté
    req.user = null;
    res.clearCookie('token');
  }
  next();
};

/**
 * Bloque la requête si l'utilisateur n'est pas authentifié.
 * À utiliser après `authenticate`.
 */
const requireAuth = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ error: 'Authentification requise' });
  }
  next();
};

module.exports = { authenticate, requireAuth };
