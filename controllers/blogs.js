const router = require('express').Router();
const { Blog, User } = require('../models');
const jwt = require('jsonwebtoken');

// Middleware to find the blog by ID
const blogFinder = async (req, res, next) => {
  req.blog = await Blog.findByPk(req.params.id);
  next();
};

// Middleware for token extraction
const tokenExtractor = (req, res, next) => {
  const authorization = req.get('authorization');
  if (authorization && authorization.toLowerCase().startsWith('bearer ')) {
    try {
      req.decodedToken = jwt.verify(authorization.substring(7), process.env.SECRET);
    } catch {
      return res.status(401).json({ error: 'token invalid' });
    }
  } else {
    return res.status(401).json({ error: 'token missing' });
  }
  next();
};

// GET all blogs
router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.findAll({
      attributes: { exclude: ['userId'] },
      include: {
        model: User,
        attributes: ['name']
      }
    });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// POST a new blog
router.post('/', tokenExtractor, async (req, res) => {
  try {
    const user = await User.findByPk(req.decodedToken.id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create blog and associate it with the logged-in user
    const { title, author, url, likes } = req.body;
    const newBlog = await Blog.create({
      title,
      author,
      url,
      likes,
      userId: user.id,  // Associate the blog with the user who created it
    });

    res.status(201).json(newBlog);
  } catch (error) {
    console.error('Error creating blog:', error);
    res.status(400).json({ error: 'Failed to create blog' });
  }
});

// GET a specific blog
router.get('/:id', blogFinder, async (req, res) => {
  if (req.blog) {
    res.json(req.blog);
  } else {
    res.status(404).end();
  }
});

// DELETE a blog
router.delete('/:id', blogFinder, tokenExtractor, async (req, res) => {
  if (req.blog) {
    // Check if the userId of the blog matches the logged-in user's id
    if (req.blog.userId !== req.decodedToken.id) {
      return res.status(403).json({ error: 'You do not have permission to delete this blog' });
    }

    await req.blog.destroy();
    res.status(204).end();
  } else {
    res.status(404).json({ error: 'Blog not found' });
  }
});

// PUT - Update a blog's likes
router.put('/:id', blogFinder, async (req, res) => {
  if (req.blog) {
    req.blog.likes = req.body.likes;
    await req.blog.save();
    res.json(req.blog);
  } else {
    res.status(404).json({ error: 'Blog not found' });
  }
});

module.exports = router;
