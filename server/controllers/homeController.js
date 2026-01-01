exports.landingPage = (req, res) => {
  res.render('index', {
    title: 'Welcome',
    showNavbar: false
  });
};
