// models/UserLogin.js

const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const UserLogin = sequelize.define(
    'UserLogin',
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      userId: { type: DataTypes.STRING, allowNull: false },
      loginTime: { type: DataTypes.DATE, allowNull: false, defaultValue: DataTypes.NOW },
      userAgent: { type: DataTypes.TEXT, allowNull: true },
      ipAddress: { type: DataTypes.STRING, allowNull: true },
    },
    {
      timestamps: false,
      tableName: 'UserLogins',
    }
  );

  // Define associations
  // UserLogin.associate = (models) => {
  //   UserLogin.belongsTo(models.User, { foreignKey: 'userId' });
  // };

  return UserLogin;
};
