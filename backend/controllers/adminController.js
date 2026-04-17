const User = require('../models/User');
const { ROLE_HIERARCHY } = require('../middleware/roleCheck');

const listUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password').sort({ createdAt: -1 });
    res.json(users);
  } catch {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

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

module.exports = { listUsers, updateUserRole };
