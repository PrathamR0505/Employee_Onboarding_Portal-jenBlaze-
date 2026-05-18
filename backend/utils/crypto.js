const crypto = require('crypto');

const ALGORITHM = 'aes-256-cbc';
const IV_LENGTH = 16;

function getKey() {
  const key = process.env.ENCRYPTION_KEY || '0123456789abcdef0123456789abcdef';
  return Buffer.from(key, 'utf8').slice(0, 32);
}

function encrypt(text) {
  if (!text) return null;
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getKey(), iv);
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  return iv.toString('hex') + ':' + encrypted;
}

function decrypt(encryptedText) {
  if (!encryptedText) return null;
  const parts = encryptedText.split(':');
  const iv = Buffer.from(parts.shift(), 'hex');
  const encrypted = parts.join(':');
  const decipher = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}

function mask(value) {
  if (!value) return null;
  const normalized = String(value).trim();
  if (normalized.length <= 4) return '****';
  return '****' + normalized.slice(-4);
}

/** Mask a value stored encrypted at rest (decrypt first, then mask last 4). */
function maskEncrypted(storedValue) {
  if (!storedValue) return null;
  const raw = String(storedValue).trim();
  if (!raw) return null;
  try {
    if (raw.includes(':')) {
      const decrypted = decrypt(raw);
      if (decrypted) return mask(decrypted);
    }
  } catch {
    // Fall through: treat as plaintext if not valid ciphertext
  }
  return mask(raw);
}

module.exports = { encrypt, decrypt, mask, maskEncrypted };
