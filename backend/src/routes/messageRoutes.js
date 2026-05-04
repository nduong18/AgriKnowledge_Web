const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');
const authMiddleware = require('../middleware/authMiddleware');

router.get('/conversations', authMiddleware.verifyToken, messageController.getConversations);
router.get('/unread-count', authMiddleware.verifyToken, messageController.getUnreadCount);
router.get('/:partnerId', authMiddleware.verifyToken, messageController.getMessages);
router.post('/', authMiddleware.verifyToken, messageController.sendMessage);

module.exports = router;
