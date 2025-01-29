const router = require('express').Router();
const bcrypt = require('bcrypt');
const { User } = require('../models');

// GET all users
router.get('/', async (req, res) => {
    try {
      const users = await User.findAll();
      res.json(users);
    } catch (error) {
      console.error('Error fetching users:', error);
      res.status(500).json({ error: 'Failed to fetch users' });
    }
  });

// POST a new user
router.post('/', async (req, res) => {
    try {
      const { username, name, password } = req.body;
  
      // Check if password is provided
      if (!password) {
        return res.status(400).json({ error: 'Password is required' });
      }
  
      const user = await User.create({ username, name, passwordHash: password });
      res.status(201).json(user);
    } catch (error) {
      if (error.name === 'SequelizeValidationError') {
        // Handle Sequelize validation error and return specific messages
        const errors = error.errors.map(e => e.message);  // Collect validation error messages
        return res.status(400).json({ error: errors });
      }
      return res.status(400).json({ error: 'Failed to create user' });
    }
  });
  

// PUT - Update a user's username
router.put('/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const { newUsername } = req.body;

    const user = await User.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    user.username = newUsername;
    await user.save();

    res.json(user);
  } catch (error) {
    res.status(400).json({ error: 'Failed to update username' });
  }
});

module.exports = router;
