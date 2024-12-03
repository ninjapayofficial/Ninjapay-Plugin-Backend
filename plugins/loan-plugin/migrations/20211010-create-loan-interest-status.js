// plugins/loan-plugin/migrations/20211010-create-loan-interest-status.js

"use strict";

module.exports = {
  up: async ({ context }) => {
    const sequelize = context;
    const queryInterface = sequelize.getQueryInterface();
    const { DataTypes } = require("sequelize");
    await queryInterface.createTable("LoanInterestStatuses", {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      clientId: { type: DataTypes.INTEGER, allowNull: false },
      year: { type: DataTypes.INTEGER, allowNull: false },
      month: { type: DataTypes.INTEGER, allowNull: false },
      status: {
        type: DataTypes.ENUM("pending", "added_to_next_month", "paid"),
        allowNull: false,
        defaultValue: "pending",
      },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    });

    // Add unique constraint to prevent duplicate entries for the same client, year, and month
    await queryInterface.addConstraint("LoanInterestStatuses", {
      fields: ["clientId", "year", "month"],
      type: "unique",
      name: "unique_client_year_month",
    });
  },
  down: async ({ context }) => {
    const sequelize = context;
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.dropTable("LoanInterestStatuses", {});
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_LoanInterestStatuses_status" CASCADE;',
    );
  },
};
