const express = require('express');
const router = express.Router();
const {
  getOnboardingOverview,
  getEmployeeDocuments,
  verifyDocument,
  confirmJoiningAdmin,
  inviteEmployee,
  createHrAccount,
} = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');
const { authorize } = require('../middleware/rbac');

router.get('/onboarding/overview', authenticate, authorize('hr'), getOnboardingOverview);
router.get('/documents/:userId', authenticate, authorize('hr'), getEmployeeDocuments);
router.patch('/documents/:id/verify', authenticate, authorize('hr'), verifyDocument);
router.post('/joining/confirm/:userId', authenticate, authorize('hr'), confirmJoiningAdmin);
router.post('/employees/invite', authenticate, authorize('hr'), inviteEmployee);
router.post('/hr/create', authenticate, authorize('hr'), createHrAccount);

module.exports = router;
