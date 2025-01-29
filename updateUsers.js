const bcrypt = require('bcrypt');
const { User } = require('./models'); // Adjust the path to match where your 'models' directory is

// Example default password to hash for existing users
const defaultPassword = 'dundermiflin';

const updateUsersWithPassword = async () => {
  try {
    const users = await User.findAll();

    for (let user of users) {
      if (!user.passwordHash) {
        // Hash and update the password for existing users who don't have one
        const hashedPassword = await bcrypt.hash(defaultPassword, 10);
        user.passwordHash = hashedPassword;
        await user.save();
        console.log(`Updated password for user: ${user.username}`);
      }
    }

    console.log('All users updated with password hash.');
  } catch (err) {
    console.error('Error updating users:', err);
  }
};

// Run the update function
updateUsersWithPassword();
