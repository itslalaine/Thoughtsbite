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

//Routes
app.use('/', require('./server/routes/user'));
app.use('/thoughts', require('./server/routes/thoughts'));

//404 - Page Not Found
app.get(/.*/, (req, res) => {
    res.status(404).render('404');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});

//1:15