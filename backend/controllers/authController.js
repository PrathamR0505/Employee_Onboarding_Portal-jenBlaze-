const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User, EmployeeProfile } = require('../models');
const { validateSetupToken } = require('../utils/setupTokenUtil');

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }
    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }
    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );
    const profile = await EmployeeProfile.findOne({ where: { user_id: user.id } });
    res.json({
      token,
      user: formatUser(user, profile),
    });
  } catch (err) {
    next(err);
  }
};

function formatUser(user, profile) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    is_first_login: user.is_first_login,
    onboarding_status: user.onboarding_status,
    profile_complete: user.profile_complete,
    joining_date: user.joining_date,
    has_profile: !!profile,
  };
}

const validateSetup = async (req, res, next) => {
  try {
    const { token } = req.query;
    const validation = await validateSetupToken(token);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    res.json({
      valid: true,
      email: validation.record.email,
      name: validation.record.name,
      expires_at: validation.record.expires_at,
    });
  } catch (err) {
    next(err);
  }
};

const setup = async (req, res, next) => {
  try {
    const { email, password, name, setup_token } = req.body;
    if (!setup_token) {
      return res.status(400).json({ error: 'Setup token is required. Use the link provided by HR.' });
    }
    if (!password) {
      return res.status(400).json({ error: 'Password is required.' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters.' });
    }

    const validation = await validateSetupToken(setup_token);
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }

    const tokenRecord = validation.record;
    const userEmail = email || tokenRecord.email;
    const userName = name || tokenRecord.name;

    if (userEmail.toLowerCase() !== tokenRecord.email.toLowerCase()) {
      return res.status(400).json({ error: 'Email does not match the setup invitation.' });
    }
    if (!userName) {
      return res.status(400).json({ error: 'Name is required.' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
      email: userEmail.toLowerCase(),
      password: hashedPassword,
      name: userName,
      role: 'employee',
      is_first_login: false,
      onboarding_status: 'Profile Incomplete',
      profile_complete: false,
    });

    await tokenRecord.update({
      used_at: new Date(),
      created_user_id: user.id,
    });

    const token = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
    );

    res.status(201).json({
      token,
      user: formatUser(user, null),
    });
  } catch (err) {
    next(err);
  }
};

const getMe = async (req, res, next) => {
  try {
    const user = await User.findByPk(req.user.id);
    const profile = await EmployeeProfile.findOne({ where: { user_id: req.user.id } });
    res.json({ user: formatUser(user, profile) });
  } catch (err) {
    next(err);
  }
};

module.exports = { login, setup, validateSetup, getMe };
