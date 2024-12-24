"use strict";

module.exports = {
  up: async ({ context }) => {
    const sequelize = context;
    const queryInterface = sequelize.getQueryInterface();
    const { DataTypes } = require("sequelize");
    await queryInterface.createTable("Signatures", {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      documentId: { type: DataTypes.INTEGER, allowNull: false, references: { model: "Documents", key: "id" } },
      signerEmail: { type: DataTypes.STRING, allowNull: false },
      signed: { type: DataTypes.BOOLEAN, defaultValue: false },
      signedAt: { type: DataTypes.DATE },
      signatureUrl: { type: DataTypes.STRING }, // URL for signing
      createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      updatedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
    });
  },
  down: async ({ context }) => {
    const sequelize = context;
    const queryInterface = sequelize.getQueryInterface();
    await queryInterface.dropTable("Signatures");
  },
};
