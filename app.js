require('dotenv').config();

const express = require ('express');
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');
const session = require('express-session');

const connectDB = require('./server/config/db');

const app = express();
const port = process.env.PORT || 3000;

//Connect to Database
connectDB();

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static Files
app.use(express.static('public'));

// Express Session Middleware
app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 } // 1 week
}));

//Flash Message Middleware
app.use(flash());

app.use(expressLayouts);
app.set('layout', './layouts/main');
app.set('view engine', 'ejs');

//Global Middleware
app.use(async (req, res, next) => {
  res.locals.messages = await req.flash('success');
  res.locals.errorMessages = await req.flash('error');
  next();
});

//Ensures title and description always exist
app.use((req, res, next) => {
  res.locals.title = 'ThoughtsBite';
  res.locals.description = 'A personal learning tracker';
  next();
});

//Routes
app.use('/', require('./server/routes/user'));
app.use('/thoughts', require('./server/routes/thoughts'));

//404 - Page Not Found
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page Not Found',
    description: 'The page you are looking for does not exist'
  });
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

//1:15