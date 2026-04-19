const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// ===== PUBLIC ROUTES (Nông dân có thể xem) =====
router.get('/', newsController.getAllPublishedNews);
router.get('/:id', newsController.getNewsById);

// ===== ADMIN ROUTES (Yêu cầu xác thực Admin) =====
router.get('/admin/list', verifyToken, isAdmin, newsController.getAllNewsAdmin);
router.get('/admin/:id', verifyToken, isAdmin, newsController.getNewsByIdAdmin);
router.post('/', verifyToken, isAdmin, newsController.createNews);
router.put('/:id', verifyToken, isAdmin, newsController.updateNews);
router.delete('/:id', verifyToken, isAdmin, newsController.deleteNews);

module.exports = router;
