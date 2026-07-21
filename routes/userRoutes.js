const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const auth = require('../middleware/auth');

router.get('/profile', auth, userController.getProfile);
router.put('/profile', auth, userController.updateProfile);
router.get('/avatars', auth, userController.getAvatars);
router.get('/export', auth, userController.exportData);
router.delete('/account', auth, userController.deleteAccount);

module.exports = router;
