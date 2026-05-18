module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    role: {
      type: DataTypes.ENUM('employee', 'hr'),
      defaultValue: 'employee',
    },
    is_first_login: {
      type: DataTypes.BOOLEAN,
      defaultValue: true,
    },
    onboarding_status: {
      type: DataTypes.ENUM(
        'Profile Incomplete',
        'Profile Complete',
        'Documents Uploaded',
        'Documents Submitted',
        'Documents Approved',
        'Checklist In Progress',
        'Joining Confirmed'
      ),
      defaultValue: 'Profile Incomplete',
    },
    profile_complete: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    joining_date: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
  }, {
    tableName: 'users',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['email'] },
      { fields: ['role'] },
      { fields: ['onboarding_status'] },
    ],
  });

  return User;
};
