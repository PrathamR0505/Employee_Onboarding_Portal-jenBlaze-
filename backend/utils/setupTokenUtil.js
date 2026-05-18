const crypto = require('crypto');
const { SetupToken, User } = require('../models');

function generateTokenString() {
  return crypto.randomBytes(32).toString('hex');
}

async function createSetupToken(email, name, expiresInHours = 72) {
  const existingUser = await User.findOne({ where: { email } });
  if (existingUser) {
    const err = new Error('A user with this email already exists.');
    err.statusCode = 409;
    throw err;
  }

  await SetupToken.update(
    { used_at: new Date() },
    { where: { email, used_at: null } }
  );

  const token = generateTokenString();
  const expiresAt = new Date(Date.now() + expiresInHours * 60 * 60 * 1000);
  const record = await SetupToken.create({
    token,
    email,
    name,
    expires_at: expiresAt,
  });
  return record;
}

async function validateSetupToken(token) {
  if (!token) {
    return { valid: false, error: 'Setup token is required.' };
  }
  const record = await SetupToken.findOne({ where: { token } });
  if (!record) {
    return { valid: false, error: 'Invalid setup token.' };
  }
  if (record.used_at) {
    return { valid: false, error: 'This setup link has already been used.' };
  }
  if (new Date() > record.expires_at) {
    return { valid: false, error: 'Setup token has expired. Contact HR for a new invite.' };
  }
  const existingUser = await User.findOne({ where: { email: record.email } });
  if (existingUser) {
    return { valid: false, error: 'This email is already registered.' };
  }
  return { valid: true, record };
}

module.exports = { createSetupToken, validateSetupToken, generateTokenString };
