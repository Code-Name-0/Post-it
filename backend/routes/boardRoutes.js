const express = require('express');
const router  = express.Router();
const { listBoards, getBoardBySlug, createBoard } = require('../controllers/boardController');
const { authenticate, requireAuth } = require('../middleware/auth');
const { requireRole }               = require('../middleware/roleCheck');

router.get('/boards',       listBoards);                                          // public
router.get('/boards/:slug', getBoardBySlug);                                      // public
router.post('/boards',      authenticate, requireAuth, requireRole('admin'), createBoard); // admin seulement

module.exports = router;
