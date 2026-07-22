const express = require("express");
const router = express.Router();
const profileController = require("../controllers/profileController");
const { isAuthenticated } = require('../middleware/authMiddleware');

router.get('/', isAuthenticated, profileController.profilePage);

// Edit profile
router.get("/edit", isAuthenticated, profileController.editProfilePage);
router.post("/edit", isAuthenticated, profileController.updateProfile);

// Deleted thoughts
router.get('/deleted-thoughts', isAuthenticated, profileController.deletedThoughtsPage);
router.post('/restore/:id', isAuthenticated, profileController.restoreThought);


module.exports = router;
