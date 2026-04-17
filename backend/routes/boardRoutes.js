const express = require('express');
const router = express.Router();
const { listBoards, getBoardBySlug, createBoard } = require('../controllers/boardController');
const { authenticate, requireAuth } = require('../middleware/auth');
const { requireRole } = require('../middleware/roleCheck');

router.get('/boards', listBoards);
router.get('/boards/:slug', getBoardBySlug);
router.post('/boards', authenticate, requireAuth, requireRole('admin'), createBoard);

module.exports = router;
