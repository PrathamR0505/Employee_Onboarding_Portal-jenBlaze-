const express = require('express');
const router = express.Router();
const { downloadDocument, downloadOcrDocument } = require('../controllers/downloadController');
const { authenticate } = require('../middleware/auth');

router.get('/:id', authenticate, downloadDocument);
router.get('/:id/ocr', authenticate, downloadOcrDocument);

module.exports = router;
