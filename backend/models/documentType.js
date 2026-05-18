module.exports = (sequelize, DataTypes) => {
  const DocumentType = sequelize.define('DocumentType', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    code: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    is_mandatory: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    max_size_bytes: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    allowed_extensions: {
      type: DataTypes.STRING(100),
      allowNull: false,
      defaultValue: 'pdf,jpg,jpeg,png',
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'document_types',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['code'], unique: true },
    ],
  });

  return DocumentType;
};
