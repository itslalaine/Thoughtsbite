const bcrypt = require('bcrypt');
const User = require('../models/User');
const mongoose = require('mongoose');
// const flash = require('connect-flash');

// HOME PAGE
exports.homePage = (req, res) => {
  res.render('index', {
    title: 'Home',
    description: 'This is the home page description'
  });
};

// USER LIST (with pagination)
exports.listUsers = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = 5;
  const skip = (page - 1) * limit;
  
  try {
    const totalUsers = await User.countDocuments();
    const users = await User.find({isDeleted: false })
      .sort({ createdDate: -1 })
      .skip(skip)
      .limit(limit);

    const totalPages = Math.ceil(totalUsers / limit);

    res.render('user/list', {
      title: 'Users',
      description: 'User list',
      users,
      currentPage: page,
      totalPages
    });
  } catch (error) {
    console.log(error);
  }
};

// ADD USER PAGE
exports.addUser = (req, res) => {
  res.render('user/add', {
    title: 'Add User',
    description: 'This is the User page',
    errors: {},
    oldInput: {} 
  });
};

// HANDLE ADD USER FORM SUBMISSION

exports.postUser = async (req, res) => {
  const { firstName, lastName, email, password } = req.body;

  let errors = {};

  // Password validation (server-side ONLY)
  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;

  // empty First Name field validation
  if (!firstName || firstName.trim() === '') {
    errors.firstName = 'First Name is required.';
  }
  // Empty Last Name field validation
  if (!lastName || lastName.trim() === '') {
    errors.lastName = 'Last Name is required.';
  }
  
  if (!strongPasswordRegex.test(password)) {
    errors.password =
      'Password must be at least 8 characters and include uppercase, lowercase, and a number.';
  }
  // Empty Password field validation
  if (!password || password.trim() === '') {
    errors.password = 'Password is required.';
  }
  // Email uniqueness
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    errors.email = 'Email is already in use.';
  }

  if (!email || email.trim() === '') {
    errors.email = 'Email is required.';
  }

  // If errors exist → re-render form
  if (Object.keys(errors).length > 0) {
    return res.render('user/add', {
      title: 'Add User',
      errors,
      oldInput: req.body
    });
  }

  // Create user if valid
  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    firstName,
    lastName,
    email,
    password: hashedPassword
  });

  req.flash('success', 'User created successfully');
  res.redirect('/users');
};

// SHOW update form
exports.editUserPage = async (req, res) => {
  const userId = req.params.id;

  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).render('404');
  }

  res.render('user/update', {
    title: 'Update User',
    description: 'Update user details',
    errors: {},
    oldInput: user
  });
};

// HANDLE update submission
exports.updateUser = async (req, res) => {
  const userId = req.params.id;
  const { firstName, lastName, email, password } = req.body;

  try {
    const user = await User.findById(userId);

    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/users');
    }

    // Update basic fields
    user.firstName = firstName;
    user.lastName = lastName;
    user.email = email;

    // Update password ONLY if provided
    if (password && password.trim() !== '') {
      const hashedPassword = await bcrypt.hash(password, 10);
      user.password = hashedPassword;
    }

    user.updatedDate = Date.now();

    await user.save();

    req.flash('success', 'User updated successfully');
    res.redirect('/users');

  } catch (error) {
    console.error(error);
    req.flash('error', 'Update failed');
    res.redirect(`/users/update/${userId}`);
  }
};

// SOFT DELETE USER
exports.softDeleteUser = async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await User.findById(userId);

    if (!user) {
      req.flash('error', 'User not found');
      return res.redirect('/users');
    }

    user.isDeleted = true;
    user.deletedAt = Date.now();
    user.deletedBy = req.session.user.id; 

    await user.save();

    req.flash('success', 'User deleted successfully');
    res.redirect('/users');

  } catch (error) {
    console.error(error);
    req.flash('error', 'Delete failed');
    res.redirect('/users');
  }
};



// res.render - direct access to a page
// res.redirect - redirect to another route/page after an action like creating, updating, deleting data

// post - redirect - get (PRG pattern)
// post - submit form or data
// redirect - after getting post request, redirect to another route/page
// get - fetching data from db then display the page with updated data

