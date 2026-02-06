const Thought = require("../models/Thought");

exports.profilePage = async (req, res) => {
  try {
    res.render("profile", {
      title: "My Profile",
      user: req.user
    });
  } catch (error) {
    console.error(error);
    res.redirect("/dashboard");
  }
};

exports.deletedThoughtsPage = async (req, res) => {
  try {
    const thoughts = await Thought.find({
      user: req.user.id,
      isDeleted: true
    }).sort({ deletedAt: -1 });

    res.render("profile/deleted-thoughts", {
      title: "Deleted Thoughts",
      thoughts
    });
  } catch (error) {
    console.error(error);
    res.redirect("/profile");
  }
};

exports.restoreThought = async (req, res) => {
  try {
    await Thought.findByIdAndUpdate(req.params.id, {
      isDeleted: false
    })  

    req.flash('success', 'Thought restored successfully')
    res.redirect('/profile/deleted-thoughts')
  } catch (error) {
    console.error(error)
    res.redirect('/profile/deleted-thoughts')
  }
}
