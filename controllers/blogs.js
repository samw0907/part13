const router = require('express').Router();
const { Blog } = require('../models');

// Middleware to find the blog by ID
const blogFinder = async (req, res, next) => {
  req.blog = await Blog.findByPk(req.params.id);
  next();
};

router.get('/', async (req, res) => {
  try {
    const blogs = await Blog.findAll();
    res.json(blogs);  // Returning blogs as JSON
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

router.post('/', async (req, res) => {
  try {
    const { author, url, title, likes } = req.body;
    const newBlog = await Blog.create({ author, url, title, likes });
    res.status(201).json(newBlog);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create blog' });
  }
});

router.get('/:id', blogFinder, async (req, res) => {
  if (req.blog) {
    res.json(req.blog);
  } else {
    res.status(404).end();
  }
});

router.delete('/:id', blogFinder, async (req, res) => {
  if (req.blog) {
    await req.blog.destroy();
    res.status(204).end();  // No content to return
  } else {
    res.status(404).json({ error: 'Blog not found' });
  }
});

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
