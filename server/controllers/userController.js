const User = require('../models/User');
const mongoose = require('mongoose');


//Get HomePage

exports.homePage = async (req, res) => {

    const messages = await req.flash("success");
    const locals ={
        title: "Home",
        description: "This is the home page description"
    }
    //if you want to pass more data to the index.ejs, you can add more properties to the locals object examples:
    // {locals, user: req.user, items: itemList}
    //since we are only passing locals for now, we can just pass locals directly

    try {
        const users = await User.find({}).limit(5);
        res.render('home', {locals, users, messages});
    }
    catch (error) {
        console.log(error);
    }
}

//Get New User Page
exports.addUser = async (req, res) => {

    const locals ={
        title: "Add New User",
        description: "This is the User page"
    }
    //if you want to pass more data to the index.ejs, you can add more properties to the locals object examples:
    // {locals, user: req.user, items: itemList}
    //since we are only passing locals for now, we can just pass locals directly
    res.render('user/add', locals);

}

//Create New User Page
exports.postUser = async (req, res) => {

    console.log(req.body);

    const newUser = new User({
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        password: req.body.password
    });

    try {

        await User.create(newUser);
        req.flash('success', 'User Created Successfully');

        res.redirect('/');
    }
    catch (error) {
        console.log(error);
    }
    // res.redirect('/users/add');
}