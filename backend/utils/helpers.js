const path = require('path');
const fs = require('fs');

const MIME_TO_EXT = {
  'application/pdf': ['.pdf'],
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
};

const EXT_TO_MIME = {
  pdf: 'application/pdf',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
};

const GENERIC_MIMES = new Set([
  'application/octet-stream',
  'binary/octet-stream',
  '',
]);

function normalizeAllowedExtensions(allowedExtensions) {
  return allowedExtensions.map((e) => (e.startsWith('.') ? e.slice(1) : e).toLowerCase());
}

function validateExtension(ext, allowedExtensions) {
  const normalized = ext.startsWith('.') ? ext.toLowerCase() : `.${ext.toLowerCase()}`;
  const allowed = allowedExtensions.map((e) => (e.startsWith('.') ? e : `.${e}`).toLowerCase());
  return allowed.includes(normalized);
}

function readFileHeader(filePath, length = 4100) {
  const fd = fs.openSync(filePath, 'r');
  try {
    const buffer = Buffer.alloc(length);
    const bytesRead = fs.readSync(fd, buffer, 0, length, 0);
    return buffer.subarray(0, bytesRead);
  } finally {
    fs.closeSync(fd);
  }
}

/** Detect MIME from magic bytes (works when file-type cannot parse the file). */
function detectMimeFromBuffer(buffer) {
  if (!buffer || buffer.length < 4) return null;

  if (buffer.slice(0, 4).toString('ascii') === '%PDF') {
    return 'application/pdf';
  }

  const pdfIndex = buffer.indexOf('%PDF');
  if (pdfIndex >= 0 && pdfIndex < 1024) {
    return 'application/pdf';
  }

  if (
    buffer.length >= 8
    && buffer[0] === 0x89
    && buffer[1] === 0x50
    && buffer[2] === 0x4e
    && buffer[3] === 0x47
  ) {
    return 'image/png';
  }

  if (buffer.length >= 3 && buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return 'image/jpeg';
  }

  return null;
}

function mimeMatchesExtension(mimetype, ext) {
  const expectedExts = MIME_TO_EXT[mimetype];
  if (!expectedExts) return false;
  return expectedExts.includes(ext) || (ext === '.jpeg' && mimetype === 'image/jpeg');
}

function validateFileType(mimetype, originalname, allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png']) {
  const ext = path.extname(originalname).toLowerCase();
  const allowed = normalizeAllowedExtensions(allowedExtensions);

  if (!validateExtension(ext, allowed)) {
    return { valid: false, message: `Extension ${ext} not allowed. Use: ${allowed.join(', ')}` };
  }

  const extKey = ext.replace('.', '');
  const resolvedMime = EXT_TO_MIME[extKey];

  if (GENERIC_MIMES.has(mimetype || '') && resolvedMime) {
    return { valid: true, mime: resolvedMime };
  }

  const mimeAllowed = Object.keys(MIME_TO_EXT).filter((mime) => {
    const exts = MIME_TO_EXT[mime];
    return exts.some((e) => allowed.includes(e.replace('.', '')));
  });

  if (!mimeAllowed.includes(mimetype)) {
    return {
      valid: false,
      message: `File type not allowed. Upload PDF, JPG, or PNG only.`,
    };
  }

  if (!mimeMatchesExtension(mimetype, ext)) {
    return { valid: false, message: `File type ${mimetype} does not match extension ${ext}` };
  }

  return { valid: true, mime: mimetype };
}

function validateDetectedMime(detectedMime, allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'], extHint) {
  const allowed = normalizeAllowedExtensions(allowedExtensions);

  if (detectedMime) {
    const mimeMap = {
      'application/pdf': 'pdf',
      'image/jpeg': 'jpg',
      'image/png': 'png',
    };
    const extKey = mimeMap[detectedMime];
    if (extKey && (allowed.includes(extKey) || (extKey === 'jpg' && allowed.includes('jpeg')))) {
      return { valid: true, mime: detectedMime };
    }
    return { valid: false, message: `Detected file type (${detectedMime}) is not allowed.` };
  }

  if (extHint) {
    const extKey = extHint.replace('.', '').toLowerCase();
    if (allowed.includes(extKey) && EXT_TO_MIME[extKey]) {
      return { valid: true, mime: EXT_TO_MIME[extKey], fromExtension: true };
    }
  }

  return { valid: false, message: 'Could not verify file type. Upload a valid PDF, JPG, or PNG.' };
}

async function verifyUploadedFile(filePath, originalname, allowedExtensions) {
  const ext = path.extname(originalname).toLowerCase();
  const allowed = normalizeAllowedExtensions(allowedExtensions);

  let detectedMime = null;
  try {
    const { fileTypeFromFile } = await import('file-type');
    const detected = await fileTypeFromFile(filePath);
    detectedMime = detected?.mime || null;
  } catch {
    detectedMime = null;
  }

  let validation = validateDetectedMime(detectedMime, allowed, ext);
  if (validation.valid) {
    return validation;
  }

  try {
    const header = readFileHeader(filePath);
    const magicMime = detectMimeFromBuffer(header);
    if (magicMime) {
      validation = validateDetectedMime(magicMime, allowed, ext);
      if (validation.valid) return validation;
    }
  } catch {
    // ignore read errors
  }

  const extKey = ext.replace('.', '');
  if (allowed.includes(extKey) && EXT_TO_MIME[extKey]) {
    return { valid: true, mime: EXT_TO_MIME[extKey], fromExtension: true };
  }

  return validation;
}

module.exports = {
  validateFileType,
  validateDetectedMime,
  validateExtension,
  verifyUploadedFile,
  detectMimeFromBuffer,
  MIME_TO_EXT,
  EXT_TO_MIME,
};
