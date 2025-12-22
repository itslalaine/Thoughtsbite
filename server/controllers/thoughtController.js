// HOME PAGE
exports.homePage = (req, res) => {
  res.render('thought/list', {
    title: 'Thoughts',
    description: 'Your thoughts'
  });
};

// ADD THOUGHT PAGE
exports.addThought = (req, res) => {
  res.render('thought/add', {
    title: 'Add Thought',
    description: 'Add a new thought'
  });
};

// 
exports.postThought = (req, res) => {
  res.redirect('/thoughts');
};
