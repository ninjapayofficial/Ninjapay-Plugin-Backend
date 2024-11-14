// models/index.js

const TransactionModel = require('./Transaction');
// Import other models here as needed

module.exports = (sequelize) => {
  const Transaction = TransactionModel(sequelize);
  // Initialize other models here, e.g., const User = UserModel(sequelize);

  // Define associations here if necessary
  // e.g., User.hasMany(Transaction, { foreignKey: 'userId' });

  return {
    Transaction,
    // Export other models here
    // e.g., User,
  };
};
