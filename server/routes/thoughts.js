const express = require('express');
const router = express.Router();
const thoughtController = require('../controllers/thoughtController');

// LIST
router.get('/', thoughtController.homePage);

// ADD
router.get('/add', thoughtController.addThought);
router.post('/add', thoughtController.postThought);

module.exports = router;
