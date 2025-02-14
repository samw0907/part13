require('dotenv').config();
const express = require('express');
const { PORT } = require('./util/config');
const { connectToDatabase } = require('./util/db');
const blogsRouter = require('./controllers/blogs');
const authorsRouter = require('./controllers/authors');
const usersRouter = require('./controllers/users');
const loginRouter = require('./controllers/login');
const readingListRouter = require('./controllers/readinglists');

const app = express();

app.use(express.json());  // To parse JSON bodies
app.use('/api/blogs', blogsRouter);  // Route handling for blogs
app.use('/api/authors', authorsRouter);  // Route handling for authors
app.use('/api/users', usersRouter);  // Route handling for users
app.use('/api/login', loginRouter);  // Route handling for login
app.use('/api/readinglists', readingListRouter);

// Centralized error handling middleware
app.use((err, req, res, next) => {
  console.error(err.message);  // Log error message

  // Handling Sequelize validation errors
  if (err.name === 'SequelizeValidationError') {
    const errors = err.errors.map(e => e.message);  // Collect all validation error messages
    return res.status(400).json({ error: errors });
  }

  // Catch-all error handler for other types of errors
  res.status(500).json({ error: 'Something went wrong' });
});

const start = async () => {
  await connectToDatabase();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

start();
