// migrations/20241114000100-add-notify-expiry-to-lbtc-transaction.js

"use strict";

module.exports = {
  up: async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();
    const { DataTypes, literal } = require("sequelize");

    await queryInterface.addColumn("LbtcTransaction", "notifyUrl", {
      type: DataTypes.STRING,
      allowNull: true,
    });

    await queryInterface.addColumn("LbtcTransaction", "expiry", {
      type: DataTypes.DATE, // Changed from STRING to DATE
      allowNull: true, // Set to false if expiry is required
      defaultValue: literal(
        // Adjust the SQL syntax based on your database dialect
        // Example for PostgreSQL:
        "CURRENT_TIMESTAMP + INTERVAL '10 minutes'"
        
        // Example for MySQL:
        // "NOW() + INTERVAL 10 MINUTE"
        
        // Uncomment the appropriate line based on your DBMS
      ),
    });

  },

  down: async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();

    await queryInterface.removeColumn("LbtcTransaction", "notifyUrl");
    await queryInterface.removeColumn("LbtcTransaction", "expiry");

  },
};
