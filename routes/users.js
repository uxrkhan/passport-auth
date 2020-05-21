const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs')

const User = require('../models/User');

// Get Login page
router.get('/login', (req, res) => res.render('login'));

// Get Register Page
router.get('/register', (req, res) => res.render('register'));

// Handle Post Register
router.post('/register', (req, res) => {
    const { name, email, password, password2 } = req.body;
    let errors = [];

    // Validations:
    // Check required fields
    if (!name || !email || !password || !password2) {
        errors.push({ msg: 'Please fill in all the fields.' });
    }

    // Check passwords match
    if (password != password2) {
        errors.push({ msg: "Passwords do not match." })
    }

    // Check pass length
    if (password.length < 8) {
        errors.push({ msg: "Password should be at least 8 characters long." });
    }

    if (errors.length > 0) {
        res.render('register', {
            errors, 
            name, 
            email,
            password,
            password2
        });
    } else {
        // if all details are valid then do this.
        User.findOne({ email: email })
            .then(user => {
                if (user) {
                    // User already exists
                    errors.push({ msg: "Email already exists. Please log in." })
                    res.render('register', {
                        errors,
                        name, 
                        email,
                        password,
                        password2
                    })
                } else {
                    // Adding new user to database
                    const newUser = new User({
                        name,
                        email,
                        password
                    });
                    /* The above syntax is basically ES6 for:
                    const newUser = new User({
                        name: name,
                        email: email,
                        password: password
                    })
                    */
                    
                    // Hash the password
                    bcrypt.genSalt(10, (err, salt) => {
                        bcrypt.hash(newUser.password, salt, (err, hash) => {
                            if(err) throw err;
                            // set password to hashed
                            newUser.password = hash;
                            
                            // save newUser to database
                            newUser.save()
                                .then(user => {
                                    req.flash('success_msg', 'You are now registered. You can now log in.')
                                    res.redirect('/users/login');
                                })
                                .catch(err => console.log(err));
                        });
                    });
                }
            }); 
    }

});

module.exports = router;