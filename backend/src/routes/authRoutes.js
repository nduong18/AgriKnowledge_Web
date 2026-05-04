const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/create-admin', authController.createAdmin);

// Protected routes
router.put('/profile', authMiddleware.verifyToken, authController.updateProfile);

module.exports = router;
