// plugins/khata-plugin/models/index.js

module.exports = (sequelize) => {
  const { DataTypes } = require("sequelize");

  const KhataCompany = sequelize.define(
    "KhataCompany",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.STRING, allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
    },
    {
      tableName: "KhataCompanies",
    },
  );

  const KhataParty = sequelize.define(
    "KhataParty",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      companyId: { type: DataTypes.INTEGER, allowNull: false },
      type: { type: DataTypes.ENUM("customer", "supplier"), allowNull: false },
      name: { type: DataTypes.STRING, allowNull: false },
      phoneNumber: { type: DataTypes.STRING },
      gstin: { type: DataTypes.STRING },
      billingAddress: { type: DataTypes.TEXT },
      shippingAddress: { type: DataTypes.TEXT },
      reminderDate: { type: DataTypes.DATE },
      currentBalance: { type: DataTypes.DECIMAL(10, 2), defaultValue: 0 },
    },
    {
      tableName: "KhataParties",
    },
  );

  const KhataTransaction = sequelize.define(
    "KhataTransaction",
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      partyId: { type: DataTypes.INTEGER, allowNull: false },
      amount: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
      description: { type: DataTypes.STRING },
      entryDate: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
      billImageUrl: { type: DataTypes.STRING },
      balanceAfter: { type: DataTypes.DECIMAL(10, 2) },
    },
    {
      tableName: "KhataTransactions",
    },
  );

  // Associations
  KhataCompany.hasMany(KhataParty, { foreignKey: "companyId" });
  KhataParty.belongsTo(KhataCompany, { foreignKey: "companyId" });

  KhataParty.hasMany(KhataTransaction, { foreignKey: "partyId" });
  KhataTransaction.belongsTo(KhataParty, { foreignKey: "partyId" });

  return {
    KhataCompany,
    KhataParty,
    KhataTransaction,
  };
};
