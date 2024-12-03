// plugins/loan-plugin/migrations/20211010-create-loan-transaction.js

"use strict";

module.exports = {
  up: async ({ context }) => {
    const sequelize = context;
    const queryInterface = sequelize.getQueryInterface();
    const { DataTypes } = require("sequelize");
    await queryInterface.createTable("LoanTransactions", {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      clientId: { type: DataTypes.INTEGER, allowNull: false },
      transactionType: {
        type: DataTypes.ENUM("amount_given", "amount_received"),
        allowNull: false,
      },
      amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      givenDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      interestPercent: { type: DataTypes.DECIMAL(5, 2) }, // Only for 'amount_given'
      interestDueDate: { type: DataTypes.DATE }, // Only for 'amount_given'
      description: { type: DataTypes.STRING },
      txid: { type: DataTypes.STRING },
      status: { type: DataTypes.STRING }, // e.g., 'pending', 'paid'
      balanceAfter: { type: DataTypes.DECIMAL(10, 2) },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    });
  },
  down: async ({ context }) => {
    const sequelize = context;
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.dropTable("LoanTransactions", {});
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_LoanTransactions_transactionType" CASCADE;',
    );
  },
};
