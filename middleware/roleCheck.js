/**
 * Hiérarchie des rôles (index = niveau d'autorisation).
 * Un utilisateur au niveau N possède tous les droits des niveaux < N.
 *
 *  0 guest   → lecture seule
 *  1 creator → créer et déplacer ses post-its
 *  2 editor  → modifier ses post-its (+ droits creator)
 *  3 eraser  → supprimer ses post-its (+ droits editor)
 *  4 admin   → tout faire sur tous les post-its + page admin
 */
const ROLE_HIERARCHY = ['guest', 'creator', 'editor', 'eraser', 'admin'];

const getRoleLevel = (role) => {
  const idx = ROLE_HIERARCHY.indexOf(role || 'guest');
  return idx === -1 ? 0 : idx;
};

/**
 * Middleware factory : exige au moins le rôle `minRole`.
 * À utiliser après `authenticate`.
 */
const requireRole = (minRole) => (req, res, next) => {
  const userLevel     = getRoleLevel(req.user ? req.user.role : 'guest');
  const requiredLevel = getRoleLevel(minRole);

  if (userLevel >= requiredLevel) return next();
  return res.status(403).json({
    error: `Rôle insuffisant. Requis : ${minRole} (niveau ${requiredLevel}), vous : ${req.user?.role || 'guest'} (niveau ${userLevel})`,
  });
};

module.exports = { requireRole, getRoleLevel, ROLE_HIERARCHY };
