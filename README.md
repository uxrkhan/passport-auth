# How this project was made...

Since this repo is made for learning purposes, this README file shows how this project was made as it can be used as a reference or boilerplate code for adding authentication feature to any project website such as a blog or anything that deals with user accounts.
 
## Initializing and installing dependencies

```
    npm init -y
    npm install express ejs express-ejs-layouts express-session
    npm install bcryptjs passport passport-local
    npm install mongoose connect-flash
```

## Initial Directory structure

```
.
├── node_modules/
├── app.js
├── package.json
├── package-lock.json
├── routes/
|   ├── index.js
|   └── users.js
└── views/
    ├── dashboard.ejs
    ├── welcome.ejs
    ├── layout.ejs
    ├── login.ejs
    └── register.ejs

```

## Making app.js

- Made a simple express server on app.js
- Made a route for '/' page pointing to index.js 
- Made routes for '/users/login' and '/users/register' 
- Use expressLayouts middleware and set view-engine to ejs

## Making views

- The user-interface was made with ejs
    ```js
    // in app.js
    const expressLayouts = require('express-ejs-layouts');

    app.use(expressLayouts);
    app.set('view engine', 'ejs')
    ```
- Used font-awesome CDN for icons
- Used 'Stale' bootstrap theme from bootswatch.com 

### layout.ejs

This is the main html file which contains all the body of the root container 
```html
<!-- in layout.ejs -->
<body>
    <div class="container">
        <%- body %>
    </div>
    ...
```

### welcome.ejs

- The welcome.ejs view is the basically the root login page that allows the user to either register or log in

### Login and register views

- The login and register view are made with bootstrap form and form-control classes.
- In order to stop the details entered from getting cleared when form is not validated, the form `<input>` tag must have the value:
    ```html
    <input 
        ...
        value="<%= typeof email != 'undefined' ? email : '' %>">          
    ```
### The messages.ejs partial
- The register and login forms should include error messages when the user does not enter valid data. In order to do that an ejs script was written in `views/partials/messages.ejs` that was used to warn the user.
    ```html
    <% if (typeof errors != 'undefined') errors.forEach(function(err){ %>
        <%= err.msg %>
    <% }) %>
    ```
- Adding bootstrap alerts to make it look good...
    ```html
    <% if (typeof errors != 'undefined') errors.forEach(function(err){ %>
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
            <%= err.msg %>
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    <% }) %>
    ```
- This messages.ejs was included in both login.ejs and register.ejs using 
    ```html
    <%- include('./partials/messages.ejs') %>
    ````

### Dashboard view

- The dashboard is the view that should appear after the user successfully logs in. This page can contain anything. A logout button is necessary.

## Mongoose for Database
For databases, the obvious choice was MongoDB. 

```js
// in app.js
const mongodb = require('mongodb');

// config db
const uri = require('./config/keys').MongoURI;

// connecting to db
const client = new mongodb.MongoClient(uri, { useNewUrlParser: true });
client.connect(err => {
    console.log("MongoDB connected.");
    client.close();
})
```

### Connecting to the database
- A cluster was created on MongoDB Atlas, a cloud platfrom for MongoDB.
- In database access, a new user was created with a username and password.
- In network access, the public IP address was whitelisted.   
- The application code was obtained by clicking on 'CONNECT' > 'Connect your application' 
- This code was copied to `./config/keys.js`
    ```js
    module.exports = {
        MongoURI: "mongodb+srv://<username>:<password>@testcluster1-rw0zw.mongodb.net/test?retryWrites=true&w=majority"
    }
    // replace the <username> and <password> with the database login details.
    ```
### Creating User model

```
.
├── models/
|   └── User.js
```
```js
// in User.js
const mongodb = require('mongodb')

const UserSchema = new mongodb.Schema({
    name: { type: String, required: true},
    email: { type: String, required: true},
    password: { type: String, required: true},
    date: { type: String, default: Date.now }
})

const User = mongodb.model('User', UserSchema);

module.exports = Users;
```

## users.js for GET and POST handlers

- The users.js has handlers for the router.get and router.post methods for both login and register.
- In the router.post method, validation for the details entered (like required fields, password match, password length) is done to check if there are no errors. A list is created to store all the errors.
- If the data entered is valid, it checks if the email is already registered. If not, it creates a new user. Then it the password is hashed.

## Hashing the password using bcrypt.JS

 The password of the new user is hashed using bcryptjs
```js
    // in users.js
    const bcrypt = require('bcryptjs');
    
    // ...

    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser.password, salt, (err, hash) => {
            if(err) throw err;
            
            // set the password to hashed passw
            newUser.password = hash;

            // save the newUser to database
            newUser.save()
                .then(user => {
                    req.flash('success_msg', 'You are now registered. You can now log in.')
                    res.redirect('/users/login');
                })
                .catch(err => console.log(err));
        })
    });
```
After hashing the password, the newUser is saved to the database.

## Session API

```js
// in app.js
const session = require('session');

...

// using session middleware
app.use(session({
    secret: 'secret',
    resave: true,
    saveUninitialized: true,
}));
```

## Connect-flash 

The connect-flash module is needed because after the user registers, we are redirecting and storing it in a session. It then displays a success or error message when the user is registered. Here's how to use the flash API
```js
// in app.js
const flash = require('connect-flash');

...

// flash middleware
app.use(flash());

// Global vars 
app.use((res, req, next) => {
    res.local.success_msg = req.flash('success_msg');
    res.local.error_msg = req.flash('error_msg');
    next();
})
```

In order to display the success or error message, the following code was added to partials/messages.ejs
```html
    <% if(success_msg != '') { %>
        <div class="alert alert-success alert-dismissible fade show" role="alert">
            <%= success_msg %>
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    <% } %>

    <% if(error_msg != '') { %>
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
            <%= error_msg %>
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                <span aria-hidden="true">&times;</span>
            </button>
        </div>
    <% } %>
```

<hr>
Ok so at this point the register feature is complete. Now to finish the login authentication feature...

## Login authentication using Passport.js

- Create a passport.js file in the config folder.
- In the passport.js file, a local strategy of the passport-local was used, bcrypt was used for comparing password hashes and the User model was imported. 
    ```js
    const LocalStrategy = require('passport-local').Strategy;
    const bcrypt = require('bcryptjs');

    const User = require('../models/User');
    ```
- A function for configuring the local strategy to the passport instance was created and exported
    ```js
    // in passport.js
    const passportConfig = (passport) => {
        passport.use(new LocalStrategy({usernameField: 'email'}, (email, password, done) => {
                
            // Search for the user
            User.findOne({email: email})
                .then(user => {
                    if (!user) {
                        return done(null, false, { message: 'This email is not registered. Please Sign Up.' });
                        // syntax: done(error, user, messageObject)
                    } 

                    // if user found, compare hashes
                    bcrypt.compare(password, user.password, (err, isMatch) => {
                        if (err) throw err;
                        if (isMatch) {
                            return done(null, user);
                        } else {
                            return done(null, false, { message: 'Incorrect password.' });
                        }
                    });
                })
                .catch(err => console.log(err));
        }));
    }

    module.exports = passportConfig;
    ```
- In the app.js, the passport module was imported and its instance was configured with passport config created above
    ```js
    // in app.js
    const passport = require('passport');

    // configure passport
    const configurePassport = require('./config/passport');
    configurePassport(passport);

    ... 

    // use passport middleware
    app.use(passport.initialize());
    app.use(passport.session());
    ```
- In order to display the error messages on failed login attempts, we have to create a error alert in the messages.ejs partial:
    ```html
    <% if(error != '') { %>
        <div class="alert alert-warning alert-dismissible fade show" role="alert">
            <%= error %>
            <button type="button" class="close" data-dismiss="alert" aria-label="Close">
            <span aria-hidden="true">&times;</span>
            </button>
        </div>
    <% } %>
    ```
    And we can add a global variable for the error by editing the custom middleware in app.js
    ```js
    // in app.js

    // Using global vars (custom middleware) 
    app.use((req, res, next) => {
        ...
        ...
        res.locals.error = req.flash('error');
        next();
    })
    ```

### Handling the login POST method

- The post method on login, i.e. when the user enters login details and submits it is handled in the users.js file
    ```js
    // in users.js
    router.post('/login', (req, res, next) => {
        passport.authenticate('local', {
            successRedirect: '/dashboard',
            failureRedirect: '/users/login',
            badRequestMessage: 'Missing credentials',
            failureFlash: true
        })(req, res, next);
    });
    ```
### Handling Logout

- The logout GET request simply redirects the user back to /users/login and displays a flash message 
    ```js
    // in users.js

    // Handle logout
    router.get('/logout', (req, res, next) => {
        req.logout();
        req.flash('success_msg', 'You are now logged out.');
        res.redirect('/dashboard');
    });
    ```

## Ensuring authenticated session

At this point the login feature is not yet complete. Although a successful login redirects the user to the dashboard, the user can logout and still access the dashboard just by entering its path in the browser without having to authenticate.

This problem can be solved by making a config file to ensure authentication

- Make a file called auth.js in config folder
- This file will export a function called ensureAuthenticated that will use the passport.session() middleware called .isAuthenticated() to check if the session is authenticated
    ```js
    // in auth.js
    module.exports = {
        ensureAuthenticated: function(req, res, next) {
            if (req.isAuthenticated()) {
                return next();
            }
            req.flash('error_msg', 'You must be logged in to view this resource.');
            res.redirect('/users/login');
        } 
    }
    ```
- In index.js we have to import the above function and edit the dashboard get method as follows
    ```js
    // in index.js
    const { ensureAuthenticated } = require('../config/auth');
    
    ...
        
    router.get('/dashboard', ensureAuthentication, (req, res) => {
        res.render('dashboard');
    })
    ```
- The user's name (or any detail) must be visible in the dashboard. So to pass the user's detail do this:
    ```js
    router.get('/dashboard', ensureAuthentication, (req, res) => {
        res.render('dashboard', {user: req.user});
    })
    ```
- Then edit the dashboard.ejs file to display the user's name:
    ```html
    <div class="card m-5">
        <h1 class="card-header">Welcome, <!-- User --> <%= user.name %></h2>
        ...
    </div>
    ```
## Final Directory Structure

Finally the project directory will look something like this

```
.
├── config/
|   ├── keys.js
|   ├── auth.js
|   └── passport.js
├── routes/
|   ├── index.js
|   └── users.js
├── views/
|   ├── partials/
|   |   └── messages.ejs
|   ├── dashboard.ejs
|   ├── welcome.ejs
|   ├── layout.ejs
|   ├── login.ejs
|   └── register.ejs
├── models/
|   └── User.js
├── node_modules/
├── app.js
├── package.json
└── package-lock.json

```
