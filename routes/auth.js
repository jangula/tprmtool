const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const db = require('../db/database');
const { redirectIfAuth } = require('../middleware/auth');

// Login page
router.get('/login', redirectIfAuth, (req, res) => {
  res.render('login', { error: null });
});

// Register page
router.get('/register', redirectIfAuth, (req, res) => {
  res.render('register', { error: null });
});

// Handle registration
router.post('/register', async (req, res) => {
  const { email, password, full_name, organization } = req.body;

  try {
    // Check if user exists
    const existingUser = db.findUserByEmail.get(email);
    if (existingUser) {
      return res.render('register', { error: 'Email already registered' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const result = db.createUser.run(email, hashedPassword, full_name, organization || '');

    if (!result.lastInsertRowid) {
      return res.render('register', { error: 'Registration failed. Please try again.' });
    }

    // Log them in
    req.session.userId = result.lastInsertRowid;
    req.session.userEmail = email;
    req.session.userName = full_name;

    // Log activity (non-blocking)
    try {
      db.logActivity.run(result.lastInsertRowid, null, 'account_created', 'User account created');
    } catch (e) {
      console.error('Activity log error:', e);
    }

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Registration error:', error);
    res.render('register', { error: 'Registration failed. Please try again.' });
  }
});

// Handle login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = db.findUserByEmail.get(email);
    if (!user) {
      return res.render('login', { error: 'Invalid email or password' });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.render('login', { error: 'Invalid email or password' });
    }

    req.session.userId = user.id;
    req.session.userEmail = user.email;
    req.session.userName = user.full_name;

    // Log activity (non-blocking)
    try {
      db.logActivity.run(user.id, null, 'login', 'User logged in');
    } catch (e) {
      console.error('Activity log error:', e);
    }

    res.redirect('/dashboard');
  } catch (error) {
    console.error('Login error:', error);
    res.render('login', { error: 'Login failed. Please try again.' });
  }
});

// Logout
router.get('/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/login');
});

module.exports = router;
