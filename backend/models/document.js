module.exports = (sequelize, DataTypes) => {
  const Document = sequelize.define('Document', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'users', key: 'id' },
    },
    document_type_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'document_types', key: 'id' },
    },
    filename: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    original_name: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    mime_type: {
      type: DataTypes.STRING(100),
      allowNull: false,
    },
    file_size: {
      type: DataTypes.INTEGER,
      allowNull: false,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'rejected'),
      defaultValue: 'pending',
    },
    hr_remark: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ocr_text: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    verified_by: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
    verified_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  }, {
    tableName: 'documents',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['document_type_id'] },
      { fields: ['status'] },
      { fields: ['user_id', 'document_type_id'] },
    ],
  });

  return Document;
};
