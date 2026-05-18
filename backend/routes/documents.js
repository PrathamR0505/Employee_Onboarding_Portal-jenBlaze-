const express = require('express');
const router = express.Router();
const { uploadDocument, getMyDocuments, getDocumentTypes, submitDocuments, deleteDocument } = require('../controllers/documentController');
const { authenticate } = require('../middleware/auth');
const { documentUpload } = require('../middleware/upload');

router.get('/types', authenticate, getDocumentTypes);
router.post('/upload', authenticate, documentUpload, uploadDocument);
router.get('/my', authenticate, getMyDocuments);
router.post('/submit', authenticate, submitDocuments);
router.delete('/:id', authenticate, deleteDocument);

module.exports = router;
