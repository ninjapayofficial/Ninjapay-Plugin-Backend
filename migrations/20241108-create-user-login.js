// migrations/20241108-create-user-login.js


"use strict";

module.exports = {
  up: async ({ context }) => {
    const sequelize = context;
    const queryInterface = sequelize.getQueryInterface();
    const { DataTypes } = require("sequelize");
    await queryInterface.createTable("UserLogins", {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.STRING, allowNull: false },
      loginTime: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      userAgent: { type: DataTypes.TEXT, allowNull: true },
      ipAddress: { type: DataTypes.STRING, allowNull: true },
    });
  },
  down: async ({ context }) => {
    const sequelize = context;
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.dropTable("UserLogins");
  },
};


