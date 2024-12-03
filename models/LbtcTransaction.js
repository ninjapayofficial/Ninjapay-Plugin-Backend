// models/LbtcTransaction.js

const { DataTypes } = require("sequelize");

module.exports = (sequelize) => {
  const LbtcTransaction = sequelize.define(
    "LbtcTransaction",
    {
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
      invoiceRequest: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      status: {
        type: DataTypes.ENUM("pending", "failed", "success", "cancelled"),
        allowNull: false,
        defaultValue: "pending",
      },
      expiry: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: sequelize.literal(
          // Example for PostgreSQL:
          "CURRENT_TIMESTAMP + INTERVAL '10 minutes'",
        ),
      },
      notifyUrl: {
        // Ensure this field is defined
        type: DataTypes.STRING,
        allowNull: true, // Set to false if notifyUrl is mandatory
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
    },
    {
      freezeTableName: true,
    },
  );

  return LbtcTransaction;
};
