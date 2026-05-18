const express = require('express');
const router = express.Router();
const { confirmJoiningEmployee } = require('../controllers/adminController');
const { authenticate } = require('../middleware/auth');

router.post('/confirm', authenticate, confirmJoiningEmployee);

module.exports = router;
