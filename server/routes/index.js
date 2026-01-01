const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController');

router.get('/', (req, res) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }

  // PUBLIC landing page
  res.render('index', {
    title: 'Welcome',
    description: 'Public landing page',
    showNavbar: false
  });
});

module.exports = router;
