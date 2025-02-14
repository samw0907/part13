const router = require('express').Router();
const { User, Blog, ReadingList } = require('../models');
const jwt = require('jsonwebtoken');

// Middleware to extract the token and get user from the token
const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      req.decodedToken = jwt.verify(authorization.substring(7), process.env.SECRET);
      next();
    } catch {
      return res.status(401).json({ error: 'token invalid' });
    }
  } else {
    return res.status(401).json({ error: 'token missing' });
  }
};

// POST: Add blog to reading list
router.post('/', async (req, res) => {
  try {
    const { userId, blogId } = req.body;

    // Check if the blog and user exist
    const user = await User.findByPk(userId);
    const blog = await Blog.findByPk(blogId);

    if (!user || !blog) {
      return res.status(404).json({ error: 'User or Blog not found' });
    }

    // Add blog to reading list
    const readingListEntry = await ReadingList.create({
      userId,
      blogId,
      read: false,  // Default to unread
    });

    res.status(201).json(readingListEntry);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to add blog to reading list' });
  }
});

// PUT: Mark a blog as read
router.put('/:id', tokenExtractor, async (req, res) => {
  try {
    const { id } = req.params; // Get the ID of the reading list entry from the URL
    const { read } = req.body; // Get the read status from the request body

    if (typeof read !== 'boolean') {
      return res.status(400).json({ error: 'The "read" field must be a boolean' });
    }

    // Find the reading list entry by ID
    const readingListEntry = await ReadingList.findByPk(id);
    if (!readingListEntry) {
      return res.status(404).json({ error: 'Reading list entry not found' });
    }

    // Check if the logged-in user is the owner of the reading list entry
    if (readingListEntry.userId !== req.decodedToken.id) {
      return res.status(403).json({ error: 'You can only update your own reading list entries' });
    }

    // Update the read status
    readingListEntry.read = read;
    await readingListEntry.save();

    res.json(readingListEntry); // Return the updated entry
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to update reading list entry' });
  }
});

module.exports = router;
