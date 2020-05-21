const express = require('express');
const expressLayouts = require('express-ejs-layouts');
//const mongodb = require('mongodb')
const mongoose = require('mongoose');
const flash = require('connect-flash');
const session = require('express-session');


const app = express();

// DB config
const uri = require('./config/keys').MongoURI;

// Connect to db
mongoose.connect(uri , { useNewUrlParser: true})
    .then(() => console.log('MongoDB Connected...'))
    .catch((err) => console.log(err));
// const client = new mongodb.MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
// client.connect(err => {
//     console.log('MongoDB connected...');
// })

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

// Connect flash middleware
app.use(flash()); 

// Global vars (custom middleware)
app.use((req, res, next) => {
    res.locals.success_msg = req.flash('success_msg');
    res.locals.error_msg = req.flash('error_msg');
    next();
})

// Routes
app.use('/', require('./routes/index'));
app.use('/users', require('./routes/users'))

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log('Server started on port ' + PORT + '.'))
