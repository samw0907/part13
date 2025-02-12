const router = require('express').Router();
const bcrypt = require('bcrypt');
const { User, Blog } = require('../models');

// GET all users
router.get('/', async (req, res) => {
  try {
  const users = await User.findAll({
    include: {
      model: Blog,
      attributes: { exclude: ['userId'] }
    }
  });
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

router.get('/:id', async (req, res) => {
  const user = await User.findByPk(req.params.id)
  if (user) {
    res.json(user)
  } else {
    res.status(404).end()
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

    // Create user with hashed password
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({ username, name, passwordHash: hashedPassword });
    res.status(201).json(user);
  } catch (error) {
    if (error.name === 'SequelizeValidationError') {
      const errors = error.errors.map(e => e.message);
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

router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.destroy();
    res.status(204).end(); // Successfully deleted, no content to return
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

module.exports = router;
