const bcrypt          = require('bcrypt');
const User             = require('../models/User');
const { ROLE_HIERARCHY } = require('../middleware/roleCheck');

// GET /api/admin/users — liste tous les utilisateurs (sans les mots de passe)
const listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// POST /api/admin/users — crée un utilisateur
const createUser = async (req, res) => {
  const { username, password, role = 'creator' } = req.body;

  if (!username?.trim() || !password)
    return res.status(400).json({ error: 'username et password sont requis' });
  if (username.trim().length < 3)
    return res.status(400).json({ error: 'Le username doit faire au moins 3 caractères' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Le mot de passe doit faire au moins 6 caractères' });
  if (!ROLE_HIERARCHY.includes(role))
    return res.status(400).json({ error: `Rôle invalide. Valeurs acceptées : ${ROLE_HIERARCHY.join(', ')}` });

  try {
    const exists = await User.findOne({ username: username.trim() });
    if (exists) return res.status(409).json({ error: 'Ce nom d\'utilisateur est déjà pris' });

    const hashed = await bcrypt.hash(password, 12);
    const user = await User.create({ username: username.trim(), password: hashed, role });
    const { password: _, ...safe } = user.toObject();
    res.status(201).json(safe);
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// PUT /api/admin/users/:id/role — change le rôle d'un utilisateur
const updateUserRole = async (req, res) => {
  const { role } = req.body;

  if (!ROLE_HIERARCHY.includes(role))
    return res.status(400).json({
      error: `Rôle invalide. Valeurs acceptées : ${ROLE_HIERARCHY.join(', ')}`,
    });

  if (req.params.id === req.user._id.toString())
    return res.status(403).json({ error: 'Vous ne pouvez pas modifier votre propre rôle' });

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true, select: '-password' }
    );
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    res.json(user);
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// DELETE /api/admin/users/:id — supprime un utilisateur
const deleteUser = async (req, res) => {
  if (req.params.id === req.user._id.toString())
    return res.status(403).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });

  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'Utilisateur introuvable' });
    if (user.username === 'guest')
      return res.status(403).json({ error: 'Le compte guest système ne peut pas être supprimé' });

    await user.deleteOne();
    res.json({ message: 'Utilisateur supprimé', _id: req.params.id });
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = { listUsers, createUser, updateUserRole, deleteUser };
