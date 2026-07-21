const express = require('express');
const router = express.Router();
const statsController = require('../controllers/statsController');
const auth = require('../middleware/auth');

router.get('/', auth, statsController.getStats);
router.get('/heatmap', auth, statsController.getWeeklyHeatmap);

module.exports = router;
