const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Dashboard (PRIVATE)
router.get('/', isAuthenticated, dashboardController.dashboardPage);

module.exports = router;
