const express = require('express');
const router = express.Router();
const priceController = require('../controllers/priceController');

// Route GET /api/prices
router.get('/', priceController.getPrices);

module.exports = router;
