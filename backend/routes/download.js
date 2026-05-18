const express = require('express');
const router = express.Router();
const { downloadDocument } = require('../controllers/downloadController');
const { authenticate } = require('../middleware/auth');

router.get('/:id', authenticate, downloadDocument);

module.exports = router;
