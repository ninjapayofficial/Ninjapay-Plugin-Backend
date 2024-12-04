// plugins/loan-plugin/models/index.js

module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");

  const LoanCompany = sequelize.define(
    "LoanCompany",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.STRING, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
    },
    {
      tableName: "LoanCompanies",
    },
  );

  const LoanClient = sequelize.define(
    "LoanClient",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      companyId: { type: DataTypes.INTEGER, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      phoneNumber: { type: DataTypes.STRING },
      email: { type: DataTypes.STRING },
      address: { type: DataTypes.TEXT },
      currentBalance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    },
    {
      tableName: "LoanClients",
    },
  );

  const LoanTransaction = sequelize.define(
    "LoanTransaction",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      clientId: { type: DataTypes.INTEGER, allowNull: false },
      transactionType: {
        type: DataTypes.ENUM("amount_given", "amount_received"),
        allowNull: false,
      },
      amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      givenDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      interestPercent: { type: DataTypes.DECIMAL(5, 2) },
      interestDueDate: { type: DataTypes.DATE },
      description: { type: DataTypes.STRING },
      txid: { type: DataTypes.STRING },
      status: { type: DataTypes.STRING },
      balanceAfter: { type: DataTypes.DECIMAL(10, 2) },
    },
    {
      tableName: "LoanTransactions",
    },
  );

  const LoanInterestStatus = sequelize.define(
    "LoanInterestStatus",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      clientId: { type: DataTypes.INTEGER, allowNull: false },
      year: { type: DataTypes.INTEGER, allowNull: false },
      month: { type: DataTypes.INTEGER, allowNull: false },
      status: {
        type: DataTypes.ENUM("pending", "added_to_next_month", "paid"),
        allowNull: false,
        defaultValue: "pending",
      },
    },
    {
      tableName: "LoanInterestStatuses",
    },
  );

  // Associations
  LoanCompany.hasMany(LoanClient, { foreignKey: "companyId" });
  LoanClient.belongsTo(LoanCompany, { foreignKey: "companyId" });

  LoanClient.hasMany(LoanTransaction, { foreignKey: "clientId" });
  LoanTransaction.belongsTo(LoanClient, { foreignKey: "clientId" });

  LoanClient.hasMany(LoanInterestStatus, { foreignKey: "clientId" });
  LoanInterestStatus.belongsTo(LoanClient, { foreignKey: "clientId" });

  return {
    LoanCompany,
    LoanClient,
    LoanTransaction,
    LoanInterestStatus,
  };
};
