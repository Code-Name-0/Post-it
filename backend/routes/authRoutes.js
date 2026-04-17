const express = require('express');
const router  = express.Router();
const { signup, login, logout, loginAsGuest, me } = require('../controllers/authController');
const { authenticate, requireAuth }  = require('../middleware/auth');

router.post('/signup', signup);
router.post('/login',  login);
router.post('/logout',        authenticate, requireAuth, logout);
router.post('/login-as-guest', loginAsGuest);
router.get('/me',              authenticate, me);

module.exports = router;
