const { Document, DocumentType, ChecklistItem, ChecklistProgress, EmployeeProfile } = require('../models');
const { Op } = require('sequelize');

const PROFILE_REQUIRED_FIELDS = [
  'phone',
  'date_of_birth',
  'gender',
  'address',
  'city',
  'state',
  'postal_code',
  'bank_account_number',
  'pan_number',
  'emergency_contact_name',
  'emergency_contact_phone',
];

const STATUS_ORDER = [
  'Profile Incomplete',
  'Profile Complete',
  'Documents Uploaded',
  'Documents Submitted',
  'Documents Approved',
  'Checklist In Progress',
  'Joining Confirmed',
];

function isProfileComplete(profile) {
  if (!profile) return false;
  const data = profile.toJSON ? profile.toJSON() : profile;
  if (!data.education_json || (Array.isArray(data.education_json) && data.education_json.length === 0)) {
    return false;
  }
  return PROFILE_REQUIRED_FIELDS.every(
    (f) => data[f] !== null && data[f] !== undefined && String(data[f]).trim() !== ''
  );
}

async function getMandatoryDocumentTypes() {
  return DocumentType.findAll({ where: { is_mandatory: true } });
}

async function getUploadedDocTypeIds(userId) {
  const docs = await Document.findAll({
    where: { user_id: userId },
    attributes: ['document_type_id', 'status'],
  });
  return docs;
}

async function hasAllMandatoryDocsUploaded(userId) {
  const mandatoryTypes = await getMandatoryDocumentTypes();
  if (mandatoryTypes.length === 0) return true;
  const docs = await Document.findAll({ where: { user_id: userId } });
  const uploadedTypeIds = new Set(docs.map((d) => d.document_type_id));
  return mandatoryTypes.every((t) => uploadedTypeIds.has(t.id));
}

async function hasAllMandatoryDocsApproved(userId) {
  const mandatoryTypes = await getMandatoryDocumentTypes();
  if (mandatoryTypes.length === 0) return true;
  for (const docType of mandatoryTypes) {
    const doc = await Document.findOne({
      where: { user_id: userId, document_type_id: docType.id, status: 'approved' },
    });
    if (!doc) return false;
  }
  return true;
}

async function calculateOnboardingProgress(userId, onboardingStatus) {
  const profile = await EmployeeProfile.findOne({ where: { user_id: userId } });
  const mandatoryTypes = await getMandatoryDocumentTypes();
  const docs = await Document.findAll({ where: { user_id: userId } });
  const checklistItems = await ChecklistItem.findAll();
  const checklistProgress = await ChecklistProgress.findAll({
    where: { user_id: userId, completed: true },
  });

  let score = 0;
  const weights = { profile: 20, docs: 40, checklist: 25, joining: 15 };

  if (isProfileComplete(profile)) score += weights.profile;
  else if (profile) {
    const filled = PROFILE_REQUIRED_FIELDS.filter((f) => {
      const v = profile[f];
      return v !== null && v !== undefined && String(v).trim() !== '';
    }).length;
    score += Math.round((filled / PROFILE_REQUIRED_FIELDS.length) * weights.profile);
  }

  if (mandatoryTypes.length > 0) {
    const mandatoryIds = mandatoryTypes.map((t) => t.id);
    const mandatoryDocs = docs.filter((d) => mandatoryIds.includes(d.document_type_id));
    const approvedMandatory = mandatoryDocs.filter((d) => d.status === 'approved').length;
    score += Math.round((approvedMandatory / mandatoryTypes.length) * weights.docs);
  } else {
    score += weights.docs;
  }

  if (checklistItems.length > 0) {
    score += Math.round((checklistProgress.length / checklistItems.length) * weights.checklist);
  } else {
    score += weights.checklist;
  }

  if (onboardingStatus === 'Joining Confirmed') score += weights.joining;

  return Math.min(100, score);
}

function parseAllowedExtensions(allowedStr) {
  return (allowedStr || 'pdf,jpg,jpeg,png')
    .split(',')
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean);
}

module.exports = {
  PROFILE_REQUIRED_FIELDS,
  STATUS_ORDER,
  isProfileComplete,
  getMandatoryDocumentTypes,
  hasAllMandatoryDocsUploaded,
  hasAllMandatoryDocsApproved,
  calculateOnboardingProgress,
  parseAllowedExtensions,
};
