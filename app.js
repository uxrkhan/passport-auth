const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const expressLayouts = require('express-ejs-layouts');
const flash = require('connect-flash');
const passport = require('passport');

const app = express();

// Passport config
const configurePassport = require('./config/passport');
configurePassport(passport);

// DB config
const uri = require('./config/keys').MongoURI;

// Connect to db
mongoose.connect(uri , { useNewUrlParser: true, useUnifiedTopology: true})
    .then(() => console.log('MongoDB connected.'))
    .catch((err) => console.log('ERROR: Could not connect to database. \nPlease enter valid database credentials in the /config/keys file.'));

// eJS
app.use(expressLayouts);
app.set('view engine', 'ejs');

// Bodyparser
app.use(express.urlencoded({extended: false}));

// Express Session
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}));

// Passport middleware
app.use(passport.initialize());
app.use(passport.session());

// Connect flash middleware
app.use(flash()); 

// Global vars (custom middleware)
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    res.locals.error = req.flash('error');
    next();
})

// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'))

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server started on port ' + PORT + '.'))
