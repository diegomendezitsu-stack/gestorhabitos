const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');
const { updateProfileRules, deleteAccountRules } = require('../middleware/validate');

router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, updateProfileRules, userController.updateProfile);
router.get('/avatars', auth, userController.getAvatars);
router.get('/export', auth, userController.exportData);
router.delete('/account', auth, deleteAccountRules, userController.deleteAccount);

module.exports = router;
