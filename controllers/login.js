const router = require('express').Router();
const { SECRET } = require('../util/config');
const jwt = require('jsonwebtoken');  // Make sure this is included
const User = require('../models/user');

router.post('/', async (request, response) => {
  const body = request.body;

  // Find the user by username
  const user = await User.findOne({
    where: {
      username: body.username
    }
  });

  if (!user) {
    return response.status(401).json({
      error: 'invalid username or password'
    });
  }

  // Log the password and hash to debug
  console.log("Password provided:", body.password);
  console.log("Stored password hash:", user.password_hash);  // Stored value is not actually a hash
  
  // Directly compare password from request with the stored value in the database
  if (body.password !== user.password_hash) {
    return response.status(401).json({
      error: 'invalid username or password'
    });
  }

  const userForToken = {
    username: user.username,
    id: user.id,
  };

  // Generate a JWT token
  const token = jwt.sign(userForToken, SECRET);

  response
    .status(200)
    .send({ token, username: user.username, name: user.name });
});

module.exports = router;
