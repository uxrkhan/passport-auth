# How this project was made...

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

### login and register views

- The login and register view are made with bootstrap form and form-control classes.
- In order to stop the details entered from getting cleared when form is not validated, the form `<input>` tag must have the value:
    ```html
    <input 
        ...
        value="<%= typeof email != 'undefined' ? email : '' %>">          
    ```
- The register form should include error messages when the user does not enter valid data. In order to do that an ejs script was used to warn the user.
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
        MongoURI: "mongodb+srv://uzair:<password>@testcluster1-rw0zw.mongodb.net/test?retryWrites=true&w=majority"
    }
    // replace the <password> with the database password.
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

In order to display the success message, the following code was added to register.ejs and login.ejs
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
