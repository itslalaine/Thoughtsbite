const Thought = require("../models/Thought");
const User = require("../models/User");
const { formatThoughtDate } = require("../helpers/date");

// PROFILE PAGE
exports.profilePage = async (req, res) => {
  try {

    const user = await User.findById(req.user.id).lean();

    user.joinedDisplay = formatThoughtDate(user.createdAt);

    res.render("profile", {
      title: "My Profile",
      description: "Manage your account information.",
      pageClass: "profile-page",
      user
    });

  } catch (error) {
    console.error(error);
    res.redirect("/dashboard");
  }
};

// DELETED THOUGHTS
exports.deletedThoughtsPage = async (req, res) => {
  try {

    const thoughts = await Thought.find({
      user: req.user.id,
      isDeleted: true
    })
      .sort({ deletedAt: -1 })
      .lean();

    thoughts.forEach(thought => {
      thought.deletedDisplay = formatThoughtDate(thought.deletedAt);
    });

    res.render("profile/deleted-thoughts", {
      title: "Deleted Thoughts",
      description: "Restore previously deleted thoughts.",
      pageClass: "deleted-thoughts-page",
      thoughts
    });

  } catch (error) {
    console.error(error);
    res.redirect("/profile");
  }
};

// RESTORE THOUGHT
exports.restoreThought = async (req, res) => {
  try {

    await Thought.findByIdAndUpdate(req.params.id, {
      isDeleted: false,
      deletedAt: null
    });

    req.flash("success", "Thought restored successfully.");
    res.redirect("/profile/deleted-thoughts");

  } catch (error) {
    console.error(error);
    req.flash("error", "Unable to restore thought.");
    res.redirect("/profile/deleted-thoughts");
  }
};

// EDIT PROFILE PAGE
exports.editProfilePage = async (req, res) => {
  try {

    const user = await User.findById(req.user.id).lean();

    res.render("profile/edit", {
      title: "Edit Profile",
      description: "Update your account information.",
      pageClass: "edit-profile-page",
      user
    });

  } catch (error) {
    console.error(error);
    res.redirect("/profile");
  }
};

// UPDATE PROFILE
exports.updateProfile = async (req, res) => {
  try {

    const {
      firstName,
      lastName,
      email
    } = req.body;

    await User.findByIdAndUpdate(req.user.id, {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim()
    });

    req.flash("success", "Profile updated successfully.");

    res.redirect("/profile");

  } catch (error) {
    console.error(error);

    req.flash("error", "Unable to update profile.");

    res.redirect("/profile/edit");
  }
};