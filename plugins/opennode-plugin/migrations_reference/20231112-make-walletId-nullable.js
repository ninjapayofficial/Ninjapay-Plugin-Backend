// // /migrations/20231112-make-walletId-nullable.js
// 'use strict';

// module.exports = {
//   up: async ({ context: sequelize }) => {
//     const queryInterface = sequelize.getQueryInterface();
//     await queryInterface.changeColumn('lightning_btc_plugin_Transaction', 'walletId', {
//       type: sequelize.Sequelize.STRING,
//       allowNull: true, // Allow NULL values
//     });
//     console.log('Made walletId column nullable in lightning_btc_plugin_Transaction table.');
//   },

//   down: async ({ context: sequelize }) => {
//     const queryInterface = sequelize.getQueryInterface();
//     await queryInterface.changeColumn('lightning_btc_plugin_Transaction', 'walletId', {
//       type: sequelize.Sequelize.STRING,
//       allowNull: false, // Revert to NOT NULL
//     });
//     console.log('Reverted walletId column to NOT NULL in lightning_btc_plugin_Transaction table.');
//   },
// };
