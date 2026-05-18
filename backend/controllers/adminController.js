const bcrypt = require('bcryptjs');
const { User, EmployeeProfile, Document, DocumentType, ChecklistItem, ChecklistProgress } = require('../models');
const { maskEncrypted } = require('../utils/crypto');
const { Op } = require('sequelize');
const { createSetupToken } = require('../utils/setupTokenUtil');
const {
  hasAllMandatoryDocsApproved,
  calculateOnboardingProgress,
} = require('../utils/onboarding');

const getOnboardingOverview = async (req, res, next) => {
  try {
    const employees = await User.findAll({
      where: { role: 'employee' },
      attributes: ['id', 'email', 'name', 'onboarding_status', 'profile_complete', 'joining_date', 'created_at'],
      include: [
        {
          model: EmployeeProfile,
          attributes: ['id', 'city', 'state'],
        },
      ],
      order: [['created_at', 'DESC']],
    });

    const totalDocumentTypes = await DocumentType.count();
    const mandatoryCount = await DocumentType.count({ where: { is_mandatory: true } });

    const overview = await Promise.all(employees.map(async (emp) => {
      const docCount = await Document.count({ where: { user_id: emp.id } });
      const approvedDocs = await Document.count({ where: { user_id: emp.id, status: 'approved' } });
      const mandatoryApprovedDocs = await Document.count({
        where: { user_id: emp.id, status: 'approved' },
        include: [{
          model: DocumentType,
          where: { is_mandatory: true },
          required: true,
          attributes: [],
        }],
      });
      const pendingVerifications = await Document.count({
        where: { user_id: emp.id, status: 'pending' },
      });
      const progressPercent = await calculateOnboardingProgress(emp.id, emp.onboarding_status);

      return {
        id: emp.id,
        email: emp.email,
        name: emp.name,
        onboarding_status: emp.onboarding_status,
        profile_complete: emp.profile_complete,
        joining_date: emp.joining_date,
        city: emp.EmployeeProfile?.city || null,
        state: emp.EmployeeProfile?.state || null,
        documents_uploaded: docCount,
        documents_approved: approvedDocs,
        mandatory_documents_approved: mandatoryApprovedDocs,
        pending_verifications: pendingVerifications,
        total_document_types: totalDocumentTypes,
        total_mandatory_document_types: mandatoryCount,
        progress_percent: progressPercent,
        joined_at: emp.created_at,
      };
    }));

    const statusCounts = {};
    employees.forEach((emp) => {
      statusCounts[emp.onboarding_status] = (statusCounts[emp.onboarding_status] || 0) + 1;
    });

    res.json({
      overview,
      summary: {
        total_employees: employees.length,
        status_counts: statusCounts,
        pending_verifications_total: overview.reduce((sum, e) => sum + e.pending_verifications, 0),
      },
    });
  } catch (err) {
    next(err);
  }
};

const getEmployeeDocuments = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const employee = await User.findOne({ where: { id: userId, role: 'employee' } });
    if (!employee) {
      return res.status(404).json({ error: 'Employee not found.' });
    }
    const documents = await Document.findAll({
      where: { user_id: userId },
      include: [{ model: DocumentType, attributes: ['code', 'name', 'is_mandatory'] }],
      order: [['created_at', 'DESC']],
    });
    const profile = await EmployeeProfile.findOne({ where: { user_id: userId } });
    let profileData = null;
    if (profile) {
      profileData = profile.toJSON();
      profileData.bank_account_number = maskEncrypted(profileData.bank_account_number);
      profileData.pan_number = maskEncrypted(profileData.pan_number);
    }
    const totalDocumentTypes = await DocumentType.count();
    const approvedCount = documents.filter((d) => d.status === 'approved').length;
    const progressPercent = await calculateOnboardingProgress(employee.id, employee.onboarding_status);
    res.json({
      employee: {
        id: employee.id,
        email: employee.email,
        name: employee.name,
        onboarding_status: employee.onboarding_status,
        joining_date: employee.joining_date,
        progress_percent: progressPercent,
        documents_approved: approvedCount,
        total_document_types: totalDocumentTypes,
      },
      profile: profileData,
      documents,
    });
  } catch (err) {
    next(err);
  }
};

const verifyDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, hr_remark } = req.body;
    if (!['approved', 'rejected'].includes(status)) {
      return res.status(400).json({ error: 'Status must be "approved" or "rejected".' });
    }
    if (status === 'rejected' && !hr_remark) {
      return res.status(400).json({ error: 'HR remark is mandatory when rejecting a document.' });
    }
    const document = await Document.findByPk(id, {
      include: [{ model: DocumentType, attributes: ['code', 'name'] }],
    });
    if (!document) {
      return res.status(404).json({ error: 'Document not found.' });
    }
    await document.update({
      status,
      hr_remark: hr_remark || null,
      verified_by: req.user.id,
      verified_at: new Date(),
    });

    const employeeId = document.user_id;
    const anyRejected = await Document.findOne({
      where: { user_id: employeeId, status: 'rejected' },
    });

    if (anyRejected) {
      await User.update(
        { onboarding_status: 'Documents Uploaded' },
        {
          where: {
            id: employeeId,
            onboarding_status: { [Op.in]: ['Documents Submitted', 'Documents Approved'] },
          },
        }
      );
    } else {
      const allMandatoryApproved = await hasAllMandatoryDocsApproved(employeeId);
      if (allMandatoryApproved) {
        await User.update(
          { onboarding_status: 'Documents Approved' },
          { where: { id: employeeId } }
        );
      }
    }

    res.json({
      document: {
        id: document.id,
        status: document.status,
        hr_remark: document.hr_remark,
        document_type: document.DocumentType?.name,
      },
      message: `Document ${status}.`,
    });
  } catch (err) {
    next(err);
  }
};

async function _confirmJoining(employee, joiningDate, res) {
  if (!employee.profile_complete) {
    return res.status(400).json({
      error: 'Profile must be complete before confirming joining.',
    });
  }

  const allMandatoryApproved = await hasAllMandatoryDocsApproved(employee.id);
  if (!allMandatoryApproved) {
    return res.status(400).json({
      error: 'All mandatory documents must be approved before confirming joining.',
    });
  }

  const allChecklistItems = await ChecklistItem.findAll({ where: { is_mandatory: true } });
  if (allChecklistItems.length > 0) {
    const progress = await ChecklistProgress.findAll({
      where: {
        user_id: employee.id,
        checklist_item_id: { [Op.in]: allChecklistItems.map((i) => i.id) },
        completed: true,
      },
    });
    if (progress.length < allChecklistItems.length) {
      return res.status(400).json({ error: 'Complete all mandatory checklist items before confirming joining.' });
    }
  }

  const allowedStatuses = ['Documents Approved', 'Checklist In Progress'];
  if (!allowedStatuses.includes(employee.onboarding_status)) {
    return res.status(400).json({
      error: 'Joining can only be confirmed after all mandatory documents are approved and checklist is ready.',
    });
  }

  if (!joiningDate) {
    return res.status(400).json({ error: 'Joining date is required.' });
  }

  const parsed = new Date(joiningDate);
  if (Number.isNaN(parsed.getTime())) {
    return res.status(400).json({ error: 'Invalid joining date.' });
  }

  await employee.update({
    onboarding_status: 'Joining Confirmed',
    joining_date: joiningDate,
  });

  return res.json({
    message: 'Joining confirmed successfully.',
    onboarding_status: 'Joining Confirmed',
    joining_date: joiningDate,
  });
}

const confirmJoiningAdmin = async (req, res, next) => {
  try {
    const employee = await User.findByPk(req.params.userId);
    if (!employee || employee.role !== 'employee') {
      return res.status(404).json({ error: 'Employee not found.' });
    }
    return await _confirmJoining(employee, req.body.joining_date, res);
  } catch (err) {
    next(err);
  }
};

const confirmJoiningEmployee = async (req, res, next) => {
  try {
    const employee = await User.findByPk(req.user.id);
    if (!employee || employee.role !== 'employee') {
      return res.status(404).json({ error: 'Employee not found.' });
    }
    return await _confirmJoining(employee, req.body.joining_date, res);
  } catch (err) {
    next(err);
  }
};

const inviteEmployee = async (req, res, next) => {
  try {
    const { email, name } = req.body;
    if (!email || !name) {
      return res.status(400).json({ error: 'Email and name are required.' });
    }
    const record = await createSetupToken(email.toLowerCase(), name);
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const setupLink = `${frontendUrl}/setup?token=${record.token}`;
    res.status(201).json({
      message: 'Employee invitation created.',
      email: record.email,
      name: record.name,
      setup_token: record.token,
      setup_link: setupLink,
      expires_at: record.expires_at,
    });
  } catch (err) {
    if (err.statusCode === 409) {
      return res.status(409).json({ error: err.message });
    }
    next(err);
  }
};

const createHrAccount = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }
    const existing = await User.findOne({ where: { email } });
    if (existing) {
      return res.status(409).json({ error: 'Email already registered.' });
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      email,
      password: hashedPassword,
      name,
      role: 'hr',
      is_first_login: false,
      onboarding_status: 'Profile Complete',
      profile_complete: true,
    });
    res.status(201).json({
      message: 'HR account created successfully.',
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  getOnboardingOverview,
  getEmployeeDocuments,
  verifyDocument,
  confirmJoiningAdmin,
  confirmJoiningEmployee,
  inviteEmployee,
  createHrAccount,
};
