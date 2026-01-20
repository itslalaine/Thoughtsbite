// Logged-in users only
exports.isAuthenticated = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  //Attach user to req (important)
  req.user = req.session.user;
  next();
};

// Admin only
exports.isAdmin = (req, res, next) => {
  if (!req.session.user) {
    return res.redirect('/auth/login');
  }

  if (req.session.user.accountType !== 'admin') {
    return res.status(403).render('403', {
      title: 'Access Denied',
      description: 'Admin access only'
    });
  }

  next();
};

// Guests only (NOT logged in)
exports.isGuest = (req, res, next) => {
  if (req.session.user) {
    return res.redirect('/dashboard');
  }
  next();
};
