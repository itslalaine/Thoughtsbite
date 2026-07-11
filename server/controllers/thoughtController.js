const Thought = require('../models/Thought');
const User = require('../models/User');

// ==========================================
// FORMAT THOUGHT DATE
// ==========================================

function formatThoughtDate(date) {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const thoughtDate = new Date(date);
    thoughtDate.setHours(0, 0, 0, 0);

    const diff = Math.floor(
        (today - thoughtDate) / (1000 * 60 * 60 * 24)
    );

    if (diff === 0) return "Today";
    if (diff === 1) return "Yesterday";
    if (diff < 7) return `${diff} days ago`;

    return thoughtDate.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
    });
}

// LIST THOUGHTS (PRIVATE)
exports.thoughtPage = async (req, res) => {
  try {
    const { search, theme, sort } = req.query;

    // Base query (always applied)
    const query = {
      user: req.session.user.id,
      isDeleted: false
    };

    //Search
    if (search) {
      query.$or = [
        { content: { $regex: search, $options: 'i' } },
        { theme: { $regex: search, $options: 'i' } },
        { mood: { $regex: search, $options: 'i' } },
        { impact: { $regex: search, $options: 'i' } },
        { sourceType: { $regex: search, $options: 'i' } }
      ];
    }

    if (search && /^\d{4}$/.test(search)) {
      const year = Number(search);
      query.dateWatched = {
        $gte: new Date(`${year}-01-01`),
        $lte: new Date(`${year}-12-31`)
      };
    }

    //Theme filter
    if (theme) {
      query.theme = theme;
    }

    // ↕ Sorting
    let sortOption = { dateWatched: -1, createdAt: -1 }; // default (newest)

    if (sort === 'oldest') {
      sortOption = { dateWatched: 1, createdAt: 1 };
    }

    const thoughts = await Thought.find(query)
    .sort(sortOption)
    .lean();

    thoughts.forEach(thought => {

      thought.displayDate = formatThoughtDate(
        thought.dateWatched || thought.createdAt
      );

    });

    res.render('thought/list', {
      title: 'Thoughts',
      description: 'Your thoughts',
      pageClass: 'thoughts-page',
      thoughts,
      query: req.query, //important for keeping filters selected
      filters: { search, theme, sort } 
    });

  } catch (error) {
    console.error(error);
    res.redirect('/dashboard');
  }
};



// ADD THOUGHT PAGE
exports.addThought = (req, res) => {
  res.render('thought/add', {
    title: 'Add Thought',
    description: 'Add a new thought',
    oldInput: {},
    errors: {}
  });
};


// CREATE THOUGHT
exports.postThought = async (req, res) => {

  const {
    content,
    sourceType,
    sourceTitle,
    sourceLink,
    theme,
    mood,
    dateWatched
  } = req.body;

  let errors = {};

  // =========================
  // Reflection
  // =========================

  if (!content || content.trim() === "") {
    errors.content = "Thought content is required.";
  }

  // =========================
  // Source Type
  // =========================

  if (!sourceType || sourceType.trim() === "") {
    errors.sourceType = "Please select a source type.";
  }

  // =========================
  // Source Title
  // =========================

  if (!sourceTitle || sourceTitle.trim() === "") {
    errors.sourceTitle = "Source title is required.";
  }

  // =========================
  // Source Link (optional)
  // =========================

  if (sourceLink && sourceLink.trim() !== "") {

    const urlRegex =
      /^(https?:\/\/)([\w.-]+)\.([a-z]{2,})([/\w .-]*)*\/?$/i;

    if (!urlRegex.test(sourceLink)) {
      errors.sourceLink = "Please enter a valid URL.";
    }

  }

  // =========================
  // Theme
  // =========================

  if (!theme || theme.trim() === "") {
    errors.theme = "Please select a theme.";
  }

  // =========================
  // Mood
  // =========================

  if (!mood || mood.trim() === "") {
    errors.mood = "Please select a mood.";
  }

  // =========================
  // Date
  // =========================

  if (!dateWatched) {
    errors.dateWatched = "Please select a date.";
  }

  // =========================
  // Validation Failed
  // =========================

  if (Object.keys(errors).length > 0) {

    return res.render("thought/add", {
      title: "New Thought",
      errors,
      oldInput: req.body
    });

  }

  try {

    await Thought.create({

      user: req.session.user.id,

      content: content.trim(),
      sourceType: sourceType.trim(),
      sourceTitle: sourceTitle.trim(),
      sourceLink: sourceLink ? sourceLink.trim() : "",
      theme: theme.trim(),
      mood: mood.trim(),
      dateWatched

    });

    req.flash("success", "Thought added successfully.");
    res.redirect("/thoughts");

  } catch (error) {

    console.error(error);

    req.flash("error", "Something went wrong.");
    res.redirect("/thoughts/add");

  }

};

// VIEW SINGLE THOUGHT
exports.viewThought = async (req, res) => {
  try {
    const thoughtId = req.params.id;

    const thought = await Thought.findOne({
      _id: thoughtId,
      isDeleted: false
    }).populate('user', 'firstName lastName');

    if (!thought) {
      return res.status(404).render('404');
    }

    //Ownership check (standard users)
    if (
      req.user.accountType !== 'admin' &&
      thought.user._id.toString() !== req.user.id
    ) {
      return res.status(403).render('403', {
        title: 'Access Denied',
        description: 'You are not allowed to view this thought'
      });
    }

    res.render('thought/view', {
      title: 'Thought',
      description: 'Thought details',
      thought
    });

  } catch (error) {
    console.error(error);
    res.redirect('/thoughts');
  }
};

// SHOW EDIT THOUGHT PAGE
exports.editThoughtPage = async (req, res) => {
  try {
    const thoughtId = req.params.id;

    const thought = await Thought.findOne({
      _id: thoughtId,
      isDeleted: false
    }).lean();

    if (!thought) {
      return res.status(404).render("404");
    }

    // Ownership / admin check
    if (
      req.user.accountType !== "admin" &&
      thought.user.toString() !== req.user.id
    ) {
      return res.status(403).render("403", {
        title: "Access Denied",
        description: "You cannot edit this thought."
      });
    }

    thought.dateWatchedFormatted = thought.dateWatched
      ? new Date(thought.dateWatched).toISOString().split("T")[0]
      : "";

    res.render("thought/edit", {
      title: "Edit Thought",
      description: "Update your thought",
      thought,
      errors: {},
      oldInput: {}
    });

  } catch (error) {
    console.error(error);
    res.redirect("/thoughts");
  }
};

// UPDATE THOUGHT
exports.updateThought = async (req, res) => {

  const thoughtId = req.params.id;

  const {
    content,
    sourceType,
    sourceTitle,
    sourceLink,
    theme,
    mood,
    dateWatched
  } = req.body;

  let errors = {};

  // =========================
  // Reflection
  // =========================

  if (!content || content.trim() === "") {
    errors.content = "Reflection is required.";
  }

  // =========================
  // Source Type
  // =========================

  if (!sourceType || sourceType.trim() === "") {
    errors.sourceType = "Please select a source type.";
  }

  // =========================
  // Source Title
  // =========================

  if (!sourceTitle || sourceTitle.trim() === "") {
    errors.sourceTitle = "Please enter the source title.";
  }

  // =========================
  // Source Link (optional)
  // =========================

  if (sourceLink && sourceLink.trim() !== "") {

    const urlRegex =
      /^(https?:\/\/)([\w.-]+)\.([a-z]{2,})([/\w .-]*)*\/?$/i;

    if (!urlRegex.test(sourceLink)) {
      errors.sourceLink = "Please enter a valid URL.";
    }

  }

  // =========================
  // Theme
  // =========================

  if (!theme || theme.trim() === "") {
    errors.theme = "Please select a theme.";
  }

  // =========================
  // Mood
  // =========================

  if (!mood || mood.trim() === "") {
    errors.mood = "Please select a mood.";
  }

  // =========================
  // Date
  // =========================

  if (!dateWatched) {
    errors.dateWatched = "Please select the reflection date.";
  }

  try {

    const thought = await Thought.findOne({
      _id: thoughtId,
      isDeleted: false
    });

    if (!thought) {
      return res.status(404).render("404");
    }

    // Ownership / admin check
    if (
      req.user.accountType !== "admin" &&
      thought.user.toString() !== req.user.id
    ) {
      return res.status(403).render("403");
    }

    // Validation failed
    if (Object.keys(errors).length > 0) {

      thought.dateWatchedFormatted = thought.dateWatched
        ? new Date(thought.dateWatched).toISOString().split("T")[0]
        : "";

      return res.render("thought/edit", {
        title: "Edit Thought",
        description: "Update your thought",
        thought,
        errors,
        oldInput: req.body
      });

    }

    await Thought.findByIdAndUpdate(thoughtId, {

      content: content.trim(),
      sourceType: sourceType.trim(),
      sourceTitle: sourceTitle.trim(),
      sourceLink: sourceLink ? sourceLink.trim() : "",
      theme: theme.trim(),
      mood: mood.trim(),
      dateWatched,
      updatedAt: new Date()

    });

    req.flash("success", "Thought updated successfully.");
    res.redirect(`/thoughts/${thoughtId}`);

  } catch (error) {

    console.error(error);
    req.flash("error", "Something went wrong.");
    res.redirect("/thoughts");

  }

};

exports.deleteThought = async (req, res) => {
  try {
    const thought = await Thought.findById(req.params.id);

    if (!thought || thought.isDeleted) {
      return res.redirect('/thoughts');
    }

    // Optional: ownership check
    if (
      thought.user.toString() !== req.session.user.id &&
      req.session.user.accountType !== 'admin'
    ) {
      return res.status(403).render('403');
    }

    thought.isDeleted = true;
    thought.deletedAt = new Date();
    thought.deletedBy = req.session.user.id;

    await thought.save();

    req.flash('success', 'Thought moved to trash.');
    res.redirect('/thoughts');

  } catch (error) {
    console.error(error);
    res.redirect('/thoughts');
  }
};




