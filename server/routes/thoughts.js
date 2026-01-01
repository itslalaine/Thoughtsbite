const express = require('express');
const router = express.Router();
const thoughtController = require('../controllers/thoughtController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Protect ALL thought routes
router.use(isAuthenticated);

// LIST
router.get('/', thoughtController.homePage);

// ADD
router.get('/add', thoughtController.addThought);
router.post('/add', thoughtController.postThought);

module.exports = router;
