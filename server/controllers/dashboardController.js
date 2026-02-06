exports.dashboardPage = (req, res) => {
  res.render('dashboard/index', {
    title: 'Overview',
    description: 'Your private dashboard'
  });

  // console.log('SESSION USER:', req.session.user); for debugging

};
