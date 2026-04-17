const ROLE_HIERARCHY = ['guest', 'creator', 'editor', 'eraser', 'admin'];

const getRoleLevel = (role) => {
  const idx = ROLE_HIERARCHY.indexOf(role || 'guest');
  return idx === -1 ? 0 : idx;
};

const requireRole = (minRole) => (req, res, next) => {
  const userLevel = getRoleLevel(req.user ? req.user.role : 'guest');
  const requiredLevel = getRoleLevel(minRole);

  if (userLevel >= requiredLevel) return next();
  return res.status(403).json({
    error: `Rôle insuffisant. Requis : ${minRole} (niveau ${requiredLevel}), vous : ${req.user?.role || 'guest'} (niveau ${userLevel})`,
  });
};

module.exports = { requireRole, getRoleLevel, ROLE_HIERARCHY };
