const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

// User Route
router.get('/', userController.homePage);

router.get('/add', userController.addUser);
router.post('/add', userController.postUser);

module.exports = router;