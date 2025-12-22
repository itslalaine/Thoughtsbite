const User = require('../models/User');
const mongoose = require('mongoose');

// HOME PAGE
exports.homePage = (req, res) => {
  res.render('home', {
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
    const users = await User.find({})
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
    description: 'This is the User page'
  });
};

// CREATE USER
exports.postUser = async (req, res) => {
  try {
    await User.create({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: req.body.password
    });

    req.flash('success', 'User Created Successfully');
    res.redirect('/users'); // redirect to list page

  } catch (error) {
    console.log(error);
  }
};

// res.render - direct access to a page
// res.redirect - redirect to another route/page after an action like creating, updating, deleting data

// post - redirect - get (PRG pattern)
// post - submit form or data
// redirect - after getting post request, redirect to another route/page
// get - fetching data from db then display the page with updated data

