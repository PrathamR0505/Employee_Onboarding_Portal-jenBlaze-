const { Document, User } = require('../models');
const path = require('path');
const fs = require('fs');

const downloadDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const document = await Document.findByPk(id);
    if (!document) {
      return res.status(404).json({ error: 'Document not found.' });
    }
    if (req.user.role === 'employee' && document.user_id !== req.user.id) {
      return res.status(403).json({ error: 'You can only access your own documents.' });
    }
    const filePath = path.join(process.env.UPLOAD_DIR || './uploads', document.filename);
    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'File not found on server.' });
    }
    res.download(filePath, document.original_name);
  } catch (err) {
    next(err);
  }
};

module.exports = { downloadDocument };
