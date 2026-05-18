module.exports = (sequelize, DataTypes) => {
  const EmployeeProfile = sequelize.define('EmployeeProfile', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    user_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: { model: 'users', key: 'id' },
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    date_of_birth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    gender: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    education_json: {
      type: DataTypes.JSONB,
      allowNull: true,
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    city: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    state: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    postal_code: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
    bank_account_number: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    pan_number: {
      type: DataTypes.STRING(500),
      allowNull: true,
    },
    emergency_contact_name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    emergency_contact_phone: {
      type: DataTypes.STRING(20),
      allowNull: true,
    },
  }, {
    tableName: 'employee_profiles',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id'], unique: true },
    ],
  });

  return EmployeeProfile;
};
