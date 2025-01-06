// plugins/lightning-btc-plugin/migrations/20231108-create-transaction-table.js

'use strict';

module.exports = {
  up: async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();
    const { DataTypes } = require('sequelize');

    await queryInterface.createTable('lightning_btc_plugin_Transaction', {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      userId: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      walletId: {
        type: DataTypes.STRING,
        allowNull: true,
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
    await queryInterface.dropTable('lightning_btc_plugin_Transaction'); // Corrected table name
  },
};
