// migrations/20241119-create-opennode-transaction.js

'use strict';

module.exports = {
  up: async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();
    const { DataTypes } = require('sequelize');
    await queryInterface.createTable('OpennodeTransaction', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      txid: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
      },
      amount: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      description: {
        type: DataTypes.STRING,
      },
      invoiceKeyUsed: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      walletId: {
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

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('OpennodeTransaction');
  },
};
