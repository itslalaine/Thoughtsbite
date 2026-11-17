const bcrypt = require('bcrypt');
const User = require('../models/User');

// Render Registration Page
exports.registerPage = (req, res) => {
  res.locals.showNavbar = false;
  res.render('auth/register', {
    title: 'Create Account',
    description: 'Register a new account',
    errors: {},
    oldInput: {}
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

// Handle User Registration
exports.register = async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    const errors = {};

    // Normalize inputs
    const trimmedFirstName = firstName?.trim();
    const trimmedLastName = lastName?.trim();
    const normalizedEmail = email?.trim().toLowerCase();

    // Password validation
    const strongPasswordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

    // First Name
    if (!trimmedFirstName) {
      errors.firstName = 'First Name is required.';
    }

    // Last Name
    if (!trimmedLastName) {
      errors.lastName = 'Last Name is required.';
    }

    // Email
    if (!normalizedEmail) {
      errors.email = 'Email is required.';
    } else {
      const existingUser = await User.findOne({
        email: normalizedEmail
      });

      if (existingUser) {
        errors.email = 'Email is already in use.';
      }
    }

    // Password
    if (!password || password.trim() === '') {
      errors.password = 'Password is required.';
    } else if (!strongPasswordRegex.test(password)) {
      errors.password =
        'Password must be at least 8 characters and include uppercase, lowercase, and a number.';
    }

    // If validation errors exist, re-render form
    if (Object.keys(errors).length > 0) {
      return res.status(400).render('auth/register', {
        title: 'Create Account',
        errors,
        oldInput: req.body
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    await User.create({
      firstName: trimmedFirstName,
      lastName: trimmedLastName,
      email: normalizedEmail,
      password: hashedPassword
    });

    req.flash('success', 'User created successfully');
    return res.redirect('/auth/login');

  } catch (error) {
    console.error('REGISTRATION ERROR:', error);

    req.flash('error', 'Unable to create your account. Please try again.');
    return res.redirect('/auth/register');
  }
};


//Handle User Login
exports.login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });

  //User not found OR soft deleted
  if (!user || user.isDeleted) {
    req.flash('error', 'Invalid credentials');
    return res.redirect('/auth/login');
  }

  //Password check
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    req.flash('error', 'Invalid credentials');
    return res.redirect('/auth/login');
  }

  //Save user to session
  req.session.user = {
    id: user._id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
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



