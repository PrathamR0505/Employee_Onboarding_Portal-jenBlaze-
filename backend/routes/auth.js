const express = require('express');
const router = express.Router();
const { login, setup, validateSetup, getMe } = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');

router.post('/login', login);
router.get('/setup/validate', validateSetup);
router.post('/setup', setup);
router.get('/me', authenticate, getMe);

module.exports = router;
