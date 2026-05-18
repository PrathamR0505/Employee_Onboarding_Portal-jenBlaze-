module.exports = (sequelize, DataTypes) => {
  const ChecklistProgress = sequelize.define('ChecklistProgress', {
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
    checklist_item_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: { model: 'checklist_items', key: 'id' },
    },
    completed: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  }, {
    tableName: 'checklist_progress',
    timestamps: true,
    underscored: true,
    indexes: [
      { fields: ['user_id'] },
      { fields: ['checklist_item_id'] },
      { fields: ['user_id', 'checklist_item_id'], unique: true },
    ],
  });

  return ChecklistProgress;
};
