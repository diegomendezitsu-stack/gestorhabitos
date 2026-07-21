const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { registerRules, loginRules } = require('../middleware/validate');

router.post('/register', registerRules, authController.register);
router.post('/login', loginRules, authController.login);
router.post('/refresh', authController.refreshToken);

module.exports = router;
