module.exports = (sequelize, DataTypes) => {
  const SetupToken = sequelize.define('SetupToken', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    token: {
      type: DataTypes.STRING(64),
      allowNull: false,
      unique: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    expires_at: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    used_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    created_user_id: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: { model: 'users', key: 'id' },
    },
  }, {
    tableName: 'setup_tokens',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['token'], unique: true },
      { fields: ['email'] },
    ],
  });

  return SetupToken;
};
