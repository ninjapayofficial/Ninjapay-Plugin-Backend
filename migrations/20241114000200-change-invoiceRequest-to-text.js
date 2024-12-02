// migrations/20241114000200-change-invoiceRequest-to-text.js

'use strict';

module.exports = {
  up: async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();
    const { DataTypes } = require('sequelize');

    await queryInterface.changeColumn('LbtcTransaction', 'invoiceRequest', {
      type: DataTypes.TEXT,
      allowNull: true,
    });
  },

  down: async ({ context: sequelize }) => {
    const queryInterface = sequelize.getQueryInterface();
    const { DataTypes } = require('sequelize');

    await queryInterface.changeColumn('LbtcTransaction', 'invoiceRequest', {
      type: DataTypes.STRING,
      allowNull: true,
    });
  },
};
