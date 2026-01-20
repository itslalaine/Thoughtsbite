const express = require('express');
const router = express.Router();
const thoughtController = require('../controllers/thoughtController');
const { isAuthenticated } = require('../middleware/authMiddleware');

// Protect ALL thought routes
router.use(isAuthenticated);

// LIST thoughts
router.get('/', thoughtController.thoughtPage);

// ADD thought
router.get('/add', thoughtController.addThought);
router.post('/add', thoughtController.postThought);

// View thought details
router.get('/:id', thoughtController.viewThought);

// Update thought
router.get('/edit/:id', thoughtController.editThoughtPage);
router.post('/edit/:id', thoughtController.updateThought);

router.post('/:id/delete', isAuthenticated, thoughtController.deleteThought);

module.exports = router;
