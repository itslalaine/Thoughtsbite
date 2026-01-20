const Thought = require('../models/Thought');
const User = require('../models/User');


// LIST THOUGHTS (PRIVATE)
exports.thoughtPage = async (req, res) => {
  try {
   const thoughts = await Thought.find({
    user: req.user.id,
    isDeleted: false
  })
  .sort({ dateWatched: -1, createdAt: -1 });

    res.render('thought/list', {
      title: 'Thoughts',
      description: 'Your thoughts',
      thoughts
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
    source,
    sourceLink,
    theme,
    mood,
    impact,
    dateWatched
  } = req.body;

  try {
    // Basic validation
    if (!content) {
      req.flash('error', 'Thought content is required');
      return res.redirect('/thoughts/add');
    }

    await Thought.create({
      user: req.session.user.id,
      content,
      source,
      sourceLink,
      theme,
      mood,
      impact,
      dateWatched
    });

    req.flash('success', 'Thought added successfully');
    res.redirect('/thoughts');

  } catch (error) {
    console.error(error);
    req.flash('error', 'Something went wrong');
    res.redirect('/thoughts/add');
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
    });

    if (!thought) {
      return res.status(404).render('404');
    }

    // Ownership / admin check
    if (
      req.user.accountType !== 'admin' &&
      thought.user.toString() !== req.user.id
    ) {
      return res.status(403).render('403', {
        title: 'Access Denied',
        description: 'You cannot edit this thought'
      });
    }

    res.render('thought/edit', {
      title: 'Edit Thought',
      description: 'Update your thought',
      thought
    });

  } catch (error) {
    console.error(error);
    res.redirect('/thoughts');
  }
};

// UPDATE THOUGHT
exports.updateThought = async (req, res) => {
  try {
    const thoughtId = req.params.id;

    const thought = await Thought.findOne({
      _id: thoughtId,
      deletedAt: null
    });

    if (!thought) {
      return res.status(404).render('404');
    }

    // Ownership / admin check
    if (
      req.user.accountType !== 'admin' &&
      thought.user.toString() !== req.user.id
    ) {
      return res.status(403).render('403');
    }

    await Thought.findByIdAndUpdate(thoughtId, {
      content: req.body.content,
      source: req.body.source,
      sourceLink: req.body.sourceLink,
      theme: req.body.theme,
      mood: req.body.mood,
      impact: req.body.impact,
      dateWatched: req.body.dateWatched,
      updatedAt: Date.now()
    });

    req.flash('success', 'Thought updated successfully');
    res.redirect(`/thoughts/${thoughtId}`);

  } catch (error) {
    console.error(error);
    res.redirect('/thoughts');
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

    req.flash('success', 'Thought deleted');
    res.redirect('/thoughts');

  } catch (error) {
    console.error(error);
    res.redirect('/thoughts');
  }
};


