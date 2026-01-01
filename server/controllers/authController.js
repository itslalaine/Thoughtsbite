const bcrypt = require('bcrypt');
const User = require('../models/User');

// Render Registration Page
exports.registerPage = (req, res) => {
  res.locals.showNavbar = false;
  res.render('auth/register', {
    title: 'Create Account',
    description: 'Register a new account'
  });
};

// Render Login Page
exports.loginPage = (req, res) => {
  res.locals.showNavbar = false;
  res.render('auth/login', {
    title: 'Login',
    description: 'Login to your account'
  });
};

// Handle User Registration
exports.register = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  try {
    // 1. Basic validation
    if (!firstName || !lastName || !email || !password) {
      return res.redirect('/auth/register');
    }

    // 2. Check if email already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.redirect('/auth/register');
    }

    // 3. Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 4. Save user
    await User.create({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      accountType: 'standard',
      accountStatus: 'active'
    });

    // 5. Redirect to login
    res.redirect('/auth/login');

  } catch (error) {
    console.log(error);
  }
};

// Handle User Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) return res.redirect('/auth/login');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.redirect('/auth/login');

  //SAVE USER TO SESSION
  req.session.user = {
    id: user._id,
    email: user.email,
    accountType: user.accountType
  };

  res.redirect('/dashboard');
};

exports.logout = (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.log(err);
      return res.redirect('/dashboard');
    }

    res.clearCookie('sessionId'); // match session name
    res.redirect('/');
  });
};



