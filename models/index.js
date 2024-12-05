// models/index.js

const LbtcTransactionModel = require("./LbtcTransaction");
const OpennodeTransactionModel = require("./OpennodeTransaction");
const UserModel = require("./User");
const UserLoginModel = require("./UserLogin");
// Import other models here as needed

module.exports = (sequelize) => {
  const LbtcTransaction = LbtcTransactionModel(sequelize);
  const OpennodeTransaction = OpennodeTransactionModel(sequelize);
  // Initialize other models here, e.g., const User = UserModel(sequelize);
  const User = UserModel(sequelize);
  const UserLogin = UserLoginModel(sequelize);

  // Define associations
  // User.hasMany(UserLogin, { foreignKey: 'userId' });
  // UserLogin.belongsTo(User, { foreignKey: 'userId' });
  // Define associations
  // User.hasMany(UserLogin, { foreignKey: 'userId', as: 'logins' });
  // UserLogin.belongsTo(User, { foreignKey: 'userId', as: 'user' });


  // Define associations here if necessary
  // e.g., User.hasMany(Transaction, { foreignKey: 'userId' });

  return {
    LbtcTransaction,
    OpennodeTransaction,
    User,
    UserLogin,
    // Export other models here
    // e.g., User,
  };
};

// // models/index.js

// const Sequelize = require('sequelize');
// const LbtcTransactionModel = require('./LbtcTransaction');
// const OpennodeTransactionModel = require('./OpennodeTransaction');
// // Import other models as needed

// const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
//   host: process.env.DB_HOST,
//   dialect: process.env.DB_DIALECT || 'postgres',
//   port: process.env.DB_PORT || 5432,
//   dialectOptions: {
//     ssl: process.env.DB_SSL === 'true' ? {
//       require: true,
//       rejectUnauthorized: false,
//     } : false,
//   },
// });

// // Initialize models
// const LbtcTransaction = LbtcTransactionModel(sequelize);
// const OpennodeTransaction = OpennodeTransactionModel(sequelize);
// // Initialize other models here

// const models = {
//   LbtcTransaction,
//   OpennodeTransaction,
//   // Add other models here
// };

// // Define associations if any
// // e.g., User.hasMany(LbtcTransaction, { foreignKey: 'userId' });

// module.exports = { sequelize, models };
