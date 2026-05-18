const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = require('./user')(sequelize, DataTypes);
const EmployeeProfile = require('./employeeProfile')(sequelize, DataTypes);
const DocumentType = require('./documentType')(sequelize, DataTypes);
const Document = require('./document')(sequelize, DataTypes);
const ChecklistItem = require('./checklistItem')(sequelize, DataTypes);
const ChecklistProgress = require('./checklistProgress')(sequelize, DataTypes);
const SetupToken = require('./setupToken')(sequelize, DataTypes);

// Associations
User.hasOne(EmployeeProfile, { foreignKey: 'user_id', onDelete: 'CASCADE' });
EmployeeProfile.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Document, { foreignKey: 'user_id' });
Document.belongsTo(User, { foreignKey: 'user_id' });

DocumentType.hasMany(Document, { foreignKey: 'document_type_id' });
Document.belongsTo(DocumentType, { foreignKey: 'document_type_id' });

User.hasMany(ChecklistProgress, { foreignKey: 'user_id' });
ChecklistProgress.belongsTo(User, { foreignKey: 'user_id' });

ChecklistItem.hasMany(ChecklistProgress, { foreignKey: 'checklist_item_id' });
ChecklistProgress.belongsTo(ChecklistItem, { foreignKey: 'checklist_item_id' });

module.exports = {
  sequelize,
  User,
  EmployeeProfile,
  DocumentType,
  Document,
  ChecklistItem,
  ChecklistProgress,
  SetupToken,
};
