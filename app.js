require('dotenv').config();

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');
const session = require('express-session');

const connectDB = require('./server/config/db');

const app = express();
const port = process.env.PORT || 3000;

/* ------------------ MIDDLEWARE ------------------ */

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.use(session({
  secret: 'keyboard cat',
  resave: false,
  saveUninitialized: false,
  name: 'sessionId'
}));

app.use(flash());

app.use(expressLayouts);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

/* -------- GLOBAL LOCALS -------- */

app.use(async (req, res, next) => {
  res.locals.messages = await req.flash('success');
  res.locals.errorMessages = await req.flash('error');
  next();
});

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;
  res.locals.showNavbar = !!req.session.user;
  next();
});

app.use((req, res, next) => {
  res.locals.title = 'ThoughtsBite';
  res.locals.description = 'A personal learning tracker';
  next();
});

app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

/* ------------------ ROUTES ------------------ */

app.use('/users', require('./server/routes/user'));
app.use('/thoughts', require('./server/routes/thoughts'));
// app.use('/thought', require('./server/routes/thought'));
app.use('/auth', require('./server/routes/auth'));
app.use('/dashboard', require('./server/routes/dashboard'));
app.use('/', require('./server/routes/index'));
app.use('/profile', require('./server/routes/profile'));

/* ------------------ 404 ------------------ */

app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page Not Found',
    description: 'The page you are looking for does not exist'
  });
});

/* ------------------ START SERVER (IMPORTANT) ------------------ */

(async () => {
  try {
    await connectDB(); // ⬅️ WAIT FOR DB
    app.listen(port, () => {
      console.log(`Server running at http://localhost:${port}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
  }
})();
