// plugins/khata-plugin/migrations/20211010-create-khata-transaction.js

"use strict";

module.exports = {
  up: async ({ context }) => {
    const sequelize = context;
    const queryInterface = sequelize.getQueryInterface();
    const { DataTypes } = require("sequelize");
    await queryInterface.createTable("KhataTransactions", {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      partyId: { type: DataTypes.INTEGER, allowNull: false },
      amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      description: { type: DataTypes.STRING },
      entryDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      billImageUrl: { type: DataTypes.STRING },
      balanceAfter: { type: DataTypes.DECIMAL(10, 2) },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    });
  },
  down: async ({ context }) => {
    const sequelize = context;
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.dropTable("KhataTransactions", {});
  },
};
