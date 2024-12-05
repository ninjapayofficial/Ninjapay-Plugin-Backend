// models/User.js
const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define(
    'User',
    {
      id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      phoneNumber: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      pin: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      passwordHash: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      isAdmin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
      },
      kycStatus: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      vipLevel: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      securityType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      emailPin: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      freezeType: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    },
    {
      timestamps: true, // Automatically adds createdAt and updatedAt
      tableName: 'Users',
    }
  );

  // Define associations if necessary

  return User;
};
