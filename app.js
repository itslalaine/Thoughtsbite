require('dotenv').config();

const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');

const connectDB = require('./server/config/db');

const app = express();
app.set('trust proxy', 1); //Render sits behind a proxy, so this setting allows Express to recognize HTTPS requests correctly. It's important for securing session cookies in production.
const port = process.env.PORT || 3000;

/* ------------------ MIDDLEWARE ------------------ */

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));

app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  name: 'sessionId',
  store: MongoStore.create({
    mongoUrl: process.env.MONGODB_URI,
    collectionName: 'sessions'
  }),
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 1000 * 60 * 60 * 24 // 1 day
  }
}));

app.use(flash());

app.use(expressLayouts);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

/* -------- GLOBAL LOCALS -------- */

app.use((req, res, next) => {
  res.locals.messages = req.flash("success");
  res.locals.errorMessages = req.flash("error");
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
app.use('/analytics', require('./server/routes/analytics'));

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
