// migrations/20241115000000-add-invoice-status-to-lbtc-transaction.js

"use strict";

module.exports = {
  up: async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();
    const { DataTypes } = require("sequelize");

    await queryInterface.addColumn("LbtcTransaction", "invoiceRequest", {
      type: DataTypes.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("LbtcTransaction", "status", {
      type: DataTypes.ENUM("pending", "failed", "success", "cancelled"),
      allowNull: false,
      defaultValue: "pending",
    });
  },

  down: async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();

    await queryInterface.removeColumn("LbtcTransaction", "invoiceRequest");
    await queryInterface.removeColumn("LbtcTransaction", "status");
    await queryInterface.sequelize.query(
      'DROP TYPE IF EXISTS "enum_LbtcTransaction_status" CASCADE;',
    );
  },
};
