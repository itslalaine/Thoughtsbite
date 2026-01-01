exports.dashboardPage = (req, res) => {
  res.render('dashboard/index', {
    title: 'Dashboard',
    description: 'Your private dashboard'
  });

  // console.log('SESSION USER:', req.session.user); for debugging

};
