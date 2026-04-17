const express = require('express');
const router  = express.Router();
const { listUsers, updateUserRole }    = require('../controllers/adminController');
const { authenticate, requireAuth }    = require('../middleware/auth');
const { requireRole }                  = require('../middleware/roleCheck');

// Toutes les routes admin exigent : être connecté + rôle admin
const adminGuard = [authenticate, requireAuth, requireRole('admin')];

router.get('/users',          ...adminGuard, listUsers);
router.put('/users/:id/role', ...adminGuard, updateUserRole);

module.exports = router;
