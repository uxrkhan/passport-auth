# How this project was made...

## Initializing and installing dependencies

```
    npm init -y
    npm install express ejs express-ejs-layouts express-session
    npm install bcryptjs passport passport-local
    npm install mongoose connect-flash
```

## Directory structure

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
- Used font-awesome CDN for icons
- Used 'Stale' theme from bootswatch.com 

### welcome.ejs

- The welcome.ejs view is the basically the root login page that allows the user to either register or log in
