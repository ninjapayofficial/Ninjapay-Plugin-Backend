// models/index.js

const LbtcTransactionModel = require('./LbtcTransaction');
// Import other models here as needed

module.exports = (sequelize) => {
  const LbtcTransaction = LbtcTransactionModel(sequelize);
  // Initialize other models here, e.g., const User = UserModel(sequelize);

  // Define associations here if necessary
  // e.g., User.hasMany(Transaction, { foreignKey: 'userId' });

  return {
    LbtcTransaction,
    // Export other models here
    // e.g., User,
  };
};
