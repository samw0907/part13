const { Model, DataTypes } = require('sequelize');
const bcrypt = require('bcrypt');
const { sequelize } = require('../util/db');

class User extends Model {}

User.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  username: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: false,
    validate: {
      isEmail: true,  // Ensure the username is a valid email
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  passwordHash: {
    type: DataTypes.STRING,
    allowNull: false,
  }
}, {
  sequelize,
  modelName: 'user',
  timestamps: true,
  underscored: true,
  hooks: {
    beforeCreate: async (user) => {
      if (user.password) {  // Hash the plain password field
        const hashedPassword = await bcrypt.hash(user.password, 10);
        console.log("Generated hash for password:", hashedPassword);  // Log generated hash
        user.passwordHash = hashedPassword;
      }
    }
  }
  
});

module.exports = User;
