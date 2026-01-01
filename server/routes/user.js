const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { isAuthenticated, isAdmin } = require('../middleware/authMiddleware');

// Admin-only area
router.use(isAuthenticated, isAdmin);

router.get('/', userController.listUsers);
router.get('/add', userController.addUser);
router.post('/add', userController.postUser);

// router.get('/:id/edit', isAdmin, userController.editUserPage);
// router.post('/:id/edit', isAdmin, userController.updateUser);
// router.post('/:id/delete', isAdmin, userController.deleteUser);

module.exports = router;
