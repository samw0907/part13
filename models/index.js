const Blog = require('./blog');
const User = require('./user');

// Sync the user and blog models with the database
Blog.sync();
User.sync();

module.exports = { Blog, User };
