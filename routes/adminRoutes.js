const express = require('express');
const router  = express.Router();
const { listUsers, createUser, updateUserRole, deleteUser } = require('../controllers/adminController');
const { authenticate, requireAuth }    = require('../middleware/auth');
const { requireRole }                  = require('../middleware/roleCheck');

// Toutes les routes admin exigent : être connecté + rôle admin
const adminGuard = [authenticate, requireAuth, requireRole('admin')];

router.get('/users',          ...adminGuard, listUsers);
router.post('/users',         ...adminGuard, createUser);
router.put('/users/:id/role', ...adminGuard, updateUserRole);
router.delete('/users/:id',   ...adminGuard, deleteUser);

module.exports = router;
