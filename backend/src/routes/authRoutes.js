const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { isAuthenticated, isGuest } = require('../middleware/authMiddleware');

// Guest-only authentication routes
router.post('/auth/signup', isGuest, authController.signup);
router.post('/auth/login', isGuest, authController.login);

// Authenticated-only session routes
router.post('/auth/logout', isAuthenticated, authController.logout);
router.get('/auth/me', isAuthenticated, authController.getCurrentUser);

module.exports = router;
