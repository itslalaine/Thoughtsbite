exports.homePage = (req, res) => {
  const locals = {
    title: 'Thoughts',
    description: 'Your thoughts'
  };

  res.render('thought/list', { locals });
};

exports.addThought = (req, res) => {
  const locals = {
    title: 'Add Thought',
    description: 'Add a new thought'
  };

  res.render('thought/add', { locals });
};

exports.postThought = (req, res) => {
  res.redirect('/thoughts');
};
