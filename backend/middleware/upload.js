const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { DocumentType } = require('../models');
const { validateFileType, verifyUploadedFile } = require('../utils/helpers');
const { parseAllowedExtensions } = require('../utils/onboarding');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = process.env.UPLOAD_DIR || './uploads';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const validation = validateFileType(file.mimetype, file.originalname);
  if (!validation.valid) {
    cb(new Error(validation.message), false);
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024,
  },
});

const documentUpload = (req, res, next) => {
  const uploadMiddleware = upload.fields([{ name: 'file', maxCount: 1 }]);
  uploadMiddleware(req, res, async (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ error: 'File too large. Maximum is 10MB per upload.' });
      }
      return res.status(400).json({ error: err.message });
    }
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    if (!req.files || !req.files.file || req.files.file.length === 0) {
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    const file = req.files.file[0];
    const docTypeCode = req.body.document_type;
    if (!docTypeCode) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      return res.status(400).json({ error: 'document_type is required.' });
    }

    try {
      const docType = await DocumentType.findOne({ where: { code: docTypeCode } });
      if (!docType) {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        return res.status(400).json({ error: `Invalid document type: ${docTypeCode}` });
      }

      const allowedExtensions = parseAllowedExtensions(docType.allowed_extensions);

      const extCheck = validateFileType(file.mimetype, file.originalname, allowedExtensions);
      if (!extCheck.valid) {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        return res.status(400).json({ error: extCheck.message });
      }

      const contentCheck = await verifyUploadedFile(file.path, file.originalname, allowedExtensions);
      if (!contentCheck.valid) {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        return res.status(400).json({ error: contentCheck.message });
      }

      const maxSize = docType.max_size_bytes || 5 * 1024 * 1024;
      if (file.size > maxSize) {
        if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        return res.status(400).json({
          error: `File too large for ${docType.name}. Maximum size is ${Math.round(maxSize / 1024 / 1024 * 100) / 100}MB.`,
        });
      }

      req.uploadedFile = {
        filename: file.filename,
        originalname: file.originalname,
        mimetype: contentCheck.mime || extCheck.mime || file.mimetype,
        size: file.size,
        path: file.path,
      };
      req.documentType = docType;
      next();
    } catch (uploadErr) {
      if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
      next(uploadErr);
    }
  });
};

module.exports = { documentUpload };
