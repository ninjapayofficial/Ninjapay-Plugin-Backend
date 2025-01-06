// plugins/khata-plugin/migrations/20211010-create-khata-party.js

"use strict";

module.exports = {
  up: async ({ context }) => {
    const sequelize = context;
    const queryInterface = sequelize.getQueryInterface();
    const { DataTypes } = require("sequelize");
    await queryInterface.createTable("KhataParties", {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      companyId: { type: DataTypes.INTEGER, allowNull: false },
      type: { type: DataTypes.ENUM("customer", "supplier"), allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      phoneNumber: { type: DataTypes.STRING },
      gstin: { type: DataTypes.STRING },
      billingAddress: { type: DataTypes.TEXT },
      shippingAddress: { type: DataTypes.TEXT },
      reminderDate: { type: DataTypes.DATE },
      currentBalance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    });
  },
  down: async ({ context }) => {
    const sequelize = context;
    const queryInterface = sequelize.getQueryInterface();
    // Drop the table first, providing an empty options object
    await queryInterface.dropTable("KhataParties", {});
    // Then drop the ENUM type
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_KhataParties_type" CASCADE;',
    );
  },
};
