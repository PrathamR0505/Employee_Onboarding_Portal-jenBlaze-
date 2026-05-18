const { Op } = require('sequelize');
const { Document, DocumentType, User } = require('../models');
const fs = require('fs');
const path = require('path');
const { hasAllMandatoryDocsUploaded } = require('../utils/onboarding');
const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const uploadDocument = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user.profile_complete && user.onboarding_status === 'Profile Incomplete') {
      return res.status(400).json({ error: 'Complete your profile before uploading documents.' });
    }

    const docType = req.documentType;
    const docTypeCode = docType.code;

    const existingDoc = await Document.findOne({
      where: { user_id: req.user.id, document_type_id: docType.id },
    });
    if (existingDoc && existingDoc.status === 'approved') {
      return res.status(400).json({ error: 'Approved documents cannot be re-uploaded. Contact HR for replacement.' });
    }

    const file = req.uploadedFile;
    let ocrText = null;

    try {
      const filePath = path.join(process.env.UPLOAD_DIR || './uploads', file.filename);
      let usedGemini = false;
      
      if (process.env.GEMINI_API_KEY) {
        try {
          const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
          const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
          const filePart = {
            inlineData: {
              data: fs.readFileSync(filePath).toString("base64"),
              mimeType: file.mimetype
            },
          };
          const prompt = "Extract all the text and information from this document exactly as it appears. Output only the extracted text, no conversational text.";
          const result = await model.generateContent([prompt, filePart]);
          ocrText = result.response.text();
          usedGemini = true;
          console.log("OCR successfully extracted using Gemini API.");
        } catch (apiErr) {
          console.error("Gemini API Error:", apiErr.message);
          console.log("Falling back to local OCR due to Gemini failure.");
        }
      }

      if (!usedGemini) {
        // Fallback to local OCR (less accurate)
        if (file.mimetype.includes('image')) {
          const { data: { text } } = await Tesseract.recognize(filePath, 'eng');
          ocrText = text;
          console.log("OCR successfully extracted using local Tesseract.");
        } else if (file.mimetype === 'application/pdf') {
          const dataBuffer = fs.readFileSync(filePath);
          const pdfData = await pdfParse(dataBuffer);
          ocrText = pdfData.text;
          console.log("OCR successfully extracted using local pdf-parse.");
        }
      }
    } catch (ocrError) {
      console.error('OCR Extraction failed:', ocrError);
    }

    const document = await Document.create({
      user_id: req.user.id,
      document_type_id: docType.id,
      filename: file.filename,
      original_name: file.originalname,
      mime_type: file.mimetype,
      file_size: file.size,
      status: 'pending',
      ocr_text: ocrText,
    });

    if (existingDoc) {
      const oldPath = path.join(process.env.UPLOAD_DIR || './uploads', existingDoc.filename);
      if (fs.existsSync(oldPath)) {
        fs.unlinkSync(oldPath);
      }
      await existingDoc.destroy();
    }

    await User.update(
      { onboarding_status: 'Documents Uploaded' },
      { where: { id: req.user.id, onboarding_status: 'Profile Complete' } }
    );

    res.status(201).json({
      document: {
        id: document.id,
        document_type: docTypeCode,
        original_name: document.original_name,
        status: document.status,
      },
      message: 'Document uploaded successfully.',
    });
  } catch (err) {
    next(err);
  }
};

const getMyDocuments = async (req, res, next) => {
  try {
    const documents = await Document.findAll({
      where: { user_id: req.user.id },
      include: [{ model: DocumentType, attributes: ['code', 'name', 'is_mandatory'] }],
      order: [['created_at', 'DESC']],
    });
    res.json({ documents });
  } catch (err) {
    next(err);
  }
};

const getDocumentTypes = async (req, res, next) => {
  try {
    const types = await DocumentType.findAll({
      order: [['id', 'ASC']],
      attributes: ['id', 'code', 'name', 'is_mandatory', 'max_size_bytes', 'allowed_extensions', 'description'],
    });
    res.json({
      document_types: types.map((t) => ({
        ...t.toJSON(),
        max_size_mb: t.max_size_bytes ? Math.round((t.max_size_bytes / 1024 / 1024) * 100) / 100 : 5,
      })),
    });
  } catch (err) {
    next(err);
  }
};

const submitDocuments = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user.profile_complete) {
      return res.status(400).json({ error: 'Complete your profile before submitting documents.' });
    }

    const allMandatoryUploaded = await hasAllMandatoryDocsUploaded(req.user.id);
    if (!allMandatoryUploaded) {
      return res.status(400).json({
        error: 'Upload all mandatory document types before submitting for verification.',
      });
    }

    const pendingDocs = await Document.findAll({
      where: { user_id: req.user.id, status: 'pending' },
    });
    if (pendingDocs.length === 0) {
      return res.status(400).json({ error: 'No pending documents to submit.' });
    }

    await User.update(
      { onboarding_status: 'Documents Submitted' },
      {
        where: {
          id: req.user.id,
          onboarding_status: { [Op.in]: ['Documents Uploaded', 'Profile Complete'] },
        },
      }
    );
    res.json({ message: 'Documents submitted for verification.' });
  } catch (err) {
    next(err);
  }
};

const deleteDocument = async (req, res, next) => {
  try {
    const { id } = req.params;
    const document = await Document.findOne({ where: { id, user_id: req.user.id } });
    if (!document) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    const user = await User.findByPk(req.user.id);
    const restrictedStatuses = ['Documents Submitted', 'Documents Approved', 'Checklist In Progress', 'Joining Confirmed'];
    
    if (restrictedStatuses.includes(user.onboarding_status)) {
      return res.status(403).json({ error: 'You have already submitted your documents. Please contact HR to delete this document.' });
    }

    if (document.status === 'approved') {
      return res.status(403).json({ error: 'Approved documents cannot be deleted.' });
    }

    const filePath = path.join(process.env.UPLOAD_DIR || './uploads', document.filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    await document.destroy();

    res.json({ message: 'Document deleted successfully.' });
  } catch (err) {
    next(err);
  }
};

module.exports = { uploadDocument, getMyDocuments, getDocumentTypes, submitDocuments, deleteDocument };
