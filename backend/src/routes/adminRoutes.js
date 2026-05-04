const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { verifyToken, isAdmin } = require('../middleware/authMiddleware');

// Bảo vệ toàn bộ router này bằng Middleware
router.use(verifyToken, isAdmin);

router.get('/dashboard', adminController.getDashboardStats);
router.get('/products', adminController.getProducts);
router.post('/products', adminController.addProduct);
router.put('/products/:id', adminController.updateProduct);
router.delete('/products/:id', adminController.deleteProduct);

// Farmers Management
router.get('/farmers', adminController.getAllFarmers);
router.post('/farmers', adminController.addFarmer);
router.put('/farmers/:id', adminController.updateFarmer);
router.delete('/farmers/:id', adminController.deleteFarmer);

module.exports = router;
