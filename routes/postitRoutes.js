const express = require('express');
const router  = express.Router();
const {
  listPostits,
  addPostit,
  updatePostit,
  deletePostit,
  movePostit,
} = require('../controllers/postitController');
const { authenticate, requireAuth } = require('../middleware/auth');
const { requireRole }               = require('../middleware/roleCheck');

// Lecture publique — les guests peuvent voir les post-its
router.get('/liste/:boardId', authenticate, listPostits);

// Création — rôle creator minimum
router.post('/ajouter', authenticate, requireAuth, requireRole('creator'), addPostit);

// Modification texte — vérification auteur/rôle dans le controller (editor+ OU auteur)
router.put('/modifier/:id', authenticate, requireAuth, updatePostit);

// Suppression — vérification auteur/rôle dans le controller (eraser+ OU auteur)
router.delete('/effacer/:id', authenticate, requireAuth, deletePostit);

// Déplacement — rôle creator minimum + vérif auteur dans le controller
router.put('/deplacer/:id', authenticate, requireAuth, requireRole('creator'), movePostit);

module.exports = router;
