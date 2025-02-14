const router = require('express').Router();
const { Blog } = require('../models');
const { Sequelize } = require('sequelize');

// GET authors with the number of blogs and total likes
router.get('/', async (req, res) => {
  try {
    const authors = await Blog.findAll({
      attributes: [
        'author',  // Select the author field
        [Sequelize.fn('COUNT', Sequelize.col('author')), 'articles'],  // Count number of blogs for each author
        [Sequelize.fn('SUM', Sequelize.col('likes')), 'likes'],  // Sum total likes for each author
      ],
      group: ['author'],  // Group by the author field
      order: [[Sequelize.fn('SUM', Sequelize.col('likes')), 'DESC']],  // Order by total likes in descending order
    });

    res.json(authors);
  } catch (error) {
    console.error('Error fetching authors:', error);
    res.status(500).json({ error: 'Failed to fetch authors' });
  }
});

module.exports = router;
