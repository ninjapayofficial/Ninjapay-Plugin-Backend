module.exports = (sequelize) => {
    const { DataTypes } = require("sequelize");
  
    const Document = sequelize.define(
      "Document",
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        title: { type: DataTypes.STRING, allowNull: false },
        content: { type: DataTypes.TEXT, allowNull: false },
        createdBy: { type: DataTypes.STRING, allowNull: false },
      },
      {
        tableName: "Documents",
      }
    );
  
    const Signature = sequelize.define(
      "Signature",
      {
        id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
        documentId: { type: DataTypes.INTEGER, allowNull: false },
        signerEmail: { type: DataTypes.STRING, allowNull: false },
        signed: { type: DataTypes.BOOLEAN, defaultValue: false },
        signedAt: { type: DataTypes.DATE },
        signatureUrl: { type: DataTypes.STRING },
        expiresAt: { type: DataTypes.DATE, allowNull: true },
      },
      {
        tableName: "Signatures",
      }
    );
  
    // Associations
    Document.hasMany(Signature, { foreignKey: "documentId" });
    Signature.belongsTo(Document, { foreignKey: "documentId" });
  
    return {
      Document,
      Signature,
    };
  };
  