const express = require('express');
const router = express.Router();
const resetController = require('../controllers/resetController');
const { requestResetRules, resetPasswordRules } = require('../middleware/validate');

router.post('/forgot-password', requestResetRules, resetController.requestReset);
router.post('/reset-password', resetPasswordRules, resetController.resetPassword);

module.exports = router;
