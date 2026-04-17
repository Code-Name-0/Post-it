const express = require('express');
const router = express.Router();
const {
  listPostits,
  addPostit,
  updatePostit,
  deletePostit,
  movePostit,
} = require('../controllers/postitController');
const { authenticate, requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

router.get('/liste/:boardId', authenticate, listPostits);

router.post('/ajouter', authenticate, requireAuth, requireRole('creator'), addPostit);

router.put('/modifier/:id', authenticate, requireAuth, updatePostit);

router.delete('/effacer/:id', authenticate, requireAuth, deletePostit);

router.put('/deplacer/:id', authenticate, requireAuth, requireRole('creator'), movePostit);

module.exports = router;
