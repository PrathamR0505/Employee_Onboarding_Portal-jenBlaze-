const express = require('express');
const router = express.Router();
const { getChecklist, updateChecklist } = require('../controllers/checklistController');
const { authenticate } = require('../middleware/auth');

router.get('/', authenticate, getChecklist);
router.patch('/:id', authenticate, updateChecklist);

module.exports = router;
