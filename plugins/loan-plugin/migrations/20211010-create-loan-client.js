// plugins/loan-plugin/migrations/20211010-create-loan-client.js

"use strict";

module.exports = {
  up: async ({ context }) => {
    const sequelize = context;
    const queryInterface = sequelize.getQueryInterface();
    const { DataTypes } = require("sequelize");
    await queryInterface.createTable("LoanClients", {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      companyId: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      phoneNumber: { type: DataTypes.STRING },
      email: { type: DataTypes.STRING },
      address: { type: DataTypes.TEXT },
      currentBalance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    });
  },
  down: async ({ context }) => {
    const sequelize = context;
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.dropTable("LoanClients", {});
  },
};
