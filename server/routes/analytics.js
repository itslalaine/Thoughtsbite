const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// console.log('Analytics route file loaded');
router.get('/', isAuthenticated, analyticsController.analyticsPage);

module.exports = router;

