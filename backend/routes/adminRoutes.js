const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Bảo vệ toàn bộ router này bằng Middleware
router.use(verifyToken, isAdmin);

router.get('/dashboard', adminController.getDashboardStats);

module.exports = router;
