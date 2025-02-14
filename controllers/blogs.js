const router = require('express').Router();
const { Blog, User } = require('../models');
const jwt = require('jsonwebtoken');
const { Op } = require('sequelize');

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
    const where = {}

    if (req.query.search) {
      where[Op.or] = [
        { title: { [Op.substring]: req.query.search } },
        { author: { [Op.substring]: req.query.search } }
      ]
    }

    const blogs = await Blog.findAll({
      attributes: { exclude: ['user_id'] },
      include: {
        model: User,
        attributes: ['name']
      },
      where,
      order: [['likes', 'DESC']] 
    });
    res.json(blogs);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// POST a new blog
router.post('/', tokenExtractor, async (req, res) => {
  try {
    const { title, author, url, likes, year_written } = req.body;

    // Validate the 'year_written' field
    const currentYear = new Date().getFullYear();
    if (year_written < 1991 || year_written > currentYear) {
      return res.status(400).json({ error: `Invalid year written. Year must be between 1991 and ${currentYear}.` });
    }

    const user = await User.findByPk(req.decodedToken.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Create blog and associate it with the logged-in user
    const newBlog = await Blog.create({
      title,
      author,
      url,
      likes,
      year_written,  // Save the year_written field
      user_id: user.id,
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
    if (req.blog.user_id !== req.decodedToken.id) {
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
