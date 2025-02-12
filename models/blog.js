const { Model, DataTypes } = require('sequelize');
const { sequelize } = require('../util/db');

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
    },
    userId: {  // Add the userId field to associate with the user
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',  // Reference to the users table
        key: 'id',
      },
    }
  },
  {
    sequelize,
    modelName: 'blog',
    tableName: 'blogs',
    timestamps: true,
  }
);

module.exports = Blog;
