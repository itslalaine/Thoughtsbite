const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { isGuest, isAuthenticated } = require('../middleware/authMiddleware');

// Guest-only pages
router.get('/login', isGuest, authController.loginPage);
router.get('/register', isGuest, authController.registerPage);

// Guest-only actions
router.post('/login', isGuest, authController.login);
router.post('/register', isGuest, authController.register);

// Logged-in users only
router.post('/logout', isAuthenticated, authController.logout);

module.exports = router;
