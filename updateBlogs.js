const { Blog, User } = require('./models');  // Ensure the correct models are imported

const updateBlogsWithUserId = async () => {
  try {
    // Fetch all blogs
    const blogs = await Blog.findAll();

    for (let blog of blogs) {
      // Find the user by matching the blog's author with the user's name
      const user = await User.findOne({ where: { name: blog.author } });

      if (user) {
        // If the user is found, associate the blog with the user's id
        blog.userId = user.id;
        await blog.save();  // Save the updated blog
        console.log(`Updated blog with ID: ${blog.id} to user ID: ${user.id}`);
      } else {
        console.log(`No user found for blog with ID: ${blog.id}`);
      }
    }

    console.log('All blogs updated with userId.');
  } catch (err) {
    console.error('Error updating blogs:', err);
  }
};

// Run the update function
updateBlogsWithUserId();
