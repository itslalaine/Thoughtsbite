const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');

// Admin-only area
router.use(isAuthenticated, isAdmin);

router.get('/', userController.listUsers);
router.get('/add', userController.addUser);
router.post('/add', userController.postUser);

router.get('/update/:id', isAdmin, userController.editUserPage);
router.post('/update/:id', isAdmin, userController.updateUser);
router.post('/delete/:id', isAdmin, userController.softDeleteUser);

module.exports = router;
