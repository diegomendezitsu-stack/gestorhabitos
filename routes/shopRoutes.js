const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const auth = require('../middleware/auth');
const { shopRules } = require('../middleware/validate');

router.post('/comprar', auth, shopRules, shopController.comprar);
router.get('/historial', auth, shopController.getHistorial);

module.exports = router;
