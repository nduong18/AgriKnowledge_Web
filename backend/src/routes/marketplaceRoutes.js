const express = require('express');
const router = express.Router();
const marketplaceController = require('../controllers/marketplaceController');
const authMiddleware = require('../middleware/authMiddleware'); // make sure auth is available

router.get('/', marketplaceController.getPosts);
router.post('/', authMiddleware.verifyToken, marketplaceController.createPost);
router.put('/:id', authMiddleware.verifyToken, marketplaceController.updatePost);
router.delete('/:id', authMiddleware.verifyToken, marketplaceController.deletePost);

// Admin routes
const verifyAdmin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    } else {
        res.status(403).json({ error: 'Access denied. Require Admin role.' });
    }
};

router.put('/:id/verify', authMiddleware.verifyToken, verifyAdmin, marketplaceController.verifyPost);

module.exports = router;
