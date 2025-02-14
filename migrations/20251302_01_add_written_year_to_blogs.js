const { DataTypes } = require('sequelize');

module.exports = {
  up: async ({ context: queryInterface }) => {
    // Add the 'year_written' column to 'blogs' table
    await queryInterface.addColumn('blogs', 'year_written', {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1991,
        max: new Date().getFullYear(),
      },
    });
  },
  down: async ({ context: queryInterface }) => {
    // Remove the 'year_written' column
    await queryInterface.removeColumn('blogs', 'year_written');
  },
};
