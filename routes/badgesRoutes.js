const express = require('express');
const router = express.Router();
const badgesController = require('../controllers/badgesController');
const auth = require('../middleware/auth');

router.get('/', auth, badgesController.getBadges);

module.exports = router;
