const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

// POST /api/auth/signup
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ message: 'Email already registered' });
    }

    const user = await User.create({ name, email, password });
    res.status(201).json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, streak: user.streak, longestStreak: user.longestStreak || 0 },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required' });
    }

    let user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const { evaluateStreakMiss } = require('../utils/streakUtils');
    user = await evaluateStreakMiss(user);

    res.json({
      token: generateToken(user._id),
      user: { id: user._id, name: user.name, email: user.email, streak: user.streak, longestStreak: user.longestStreak || 0 },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});



// GET /api/auth/me (get current user)
router.get('/me', require('../middleware/auth').protect, async (req, res) => {
  const { evaluateStreakMiss } = require('../utils/streakUtils');
  const user = await evaluateStreakMiss(req.user);
  res.json({ id: user._id, name: user.name, email: user.email, streak: user.streak, longestStreak: user.longestStreak || 0 });
});

// PUT /api/auth/me (update profile)
router.put('/me', require('../middleware/auth').protect, async (req, res) => {
  try {
    const { name, email } = req.body;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { name, email },
      { new: true, runValidators: true }
    ).select('-password');
    res.json({ id: user._id, name: user.name, email: user.email });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/auth/token (save push token)
router.put('/token', require('../middleware/auth').protect, async (req, res) => {
  try {
    const { expoPushToken } = req.body;
    await User.findByIdAndUpdate(req.user._id, { expoPushToken });
    res.json({ message: 'Push token updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// PUT /api/auth/timezone (save timezone)
router.put('/timezone', require('../middleware/auth').protect, async (req, res) => {
  try {
    const { timezone } = req.body;
    await User.findByIdAndUpdate(req.user._id, { timezone });
    res.json({ message: 'Timezone updated successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
