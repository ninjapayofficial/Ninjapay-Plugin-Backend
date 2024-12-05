// migrations/20241108-create-users-table.js

'use strict';

module.exports = {
  up: async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();
    const { DataTypes } = require('sequelize');

    await queryInterface.createTable('Users', {
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
      createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
      },
      updatedAt: {
          type: DataTypes.DATE,
          allowNull: false,
          defaultValue: DataTypes.NOW,
      },
    });
  },
  down: async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.dropTable('Users');
  },
};
