require('dotenv').config();
const express = require('express');
const { Sequelize, Model, DataTypes } = require('sequelize');

const app = express();
app.use(express.json()); // To parse JSON bodies

const sequelize = new Sequelize(process.env.DATABASE_URL);

class Blog extends Model {}
Blog.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false
    },
    url: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    likes: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    }
  },
  {
    sequelize,
    modelName: 'blog',
    tableName: 'blogs',
    timestamps: false // Disable automatic timestamps
  }
);

// Sync the database (creating the table if it doesn't exist)
sequelize.sync()
  .then(() => console.log('Database synced!'))
  .catch((error) => console.error('Error syncing database:', error));

// GET all blogs
app.get('/api/blogs', async (req, res) => {
  try {
    const blogs = await Blog.findAll();
    res.json(blogs.map(blog => blog.toJSON()));
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch blogs' });
  }
});

// POST a new blog
app.post('/api/blogs', async (req, res) => {
  try {
    const { author, url, title, likes } = req.body;
    const newBlog = await Blog.create({ author, url, title, likes });
    res.status(201).json(newBlog);
  } catch (error) {
    res.status(400).json({ error: 'Failed to create blog' });
  }
});

// DELETE a blog by ID
app.delete('/api/blogs/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const blog = await Blog.findByPk(id);

    if (!blog) {
      return res.status(404).json({ error: 'Blog not found' });
    }

    await blog.destroy();
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete blog' });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
