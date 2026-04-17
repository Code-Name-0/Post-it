const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const isProd = process.env.NODE_ENV === 'production';
const cookieOpts = {
  httpOnly: true,
  secure: isProd,
  sameSite: isProd ? 'none' : 'strict',
  maxAge: 7 * 24 * 60 * 60 * 1000,
};

const signup = async (req, res) => {
  const { username, password } = req.body;
  if (!username?.trim() || !password)
    return res.status(400).json({ error: 'Nom d\'utilisateur et mot de passe requis' });

  if (password.length < 6)
    return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });

  try {
    if (await User.findOne({ username: username.trim() }))
      return res.status(409).json({ error: 'Nom d\'utilisateur déjà pris' });

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ username: username.trim(), password: hashed });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, cookieOpts);
    res.status(201).json({ user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const login = async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password)
    return res.status(400).json({ error: 'Champs requis manquants' });

  try {
    const user = await User.findOne({ username });
    if (!user || !(await bcrypt.compare(password, user.password)))
      return res.status(401).json({ error: 'Identifiants invalides' });

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.cookie('token', token, cookieOpts);
    res.json({ user: { id: user._id, username: user.username, role: user.role } });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const logout = (req, res) => {
  res.clearCookie('token', { ...cookieOpts, maxAge: 0 });
  res.json({ message: 'Déconnexion réussie' });
};

const loginAsGuest = async (req, res) => {
  try {
    const guest = await User.findOne({ username: 'guest', role: 'guest' });
    if (!guest) return res.status(404).json({ error: 'Compte invité indisponible' });
    const token = jwt.sign({ id: guest._id }, process.env.JWT_SECRET, { expiresIn: '1d' });
    res.cookie('token', token, { ...cookieOpts, maxAge: 24 * 60 * 60 * 1000 });
    res.json({ user: { id: guest._id, username: guest.username, role: guest.role } });
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const me = (req, res) => {
  if (!req.user) return res.json({ user: null });
  res.json({ user: { id: req.user._id, username: req.user.username, role: req.user.role } });
};

module.exports = { signup, login, logout, loginAsGuest, me };
