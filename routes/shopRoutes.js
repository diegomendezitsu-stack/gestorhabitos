const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const auth = require('../middleware/auth');

router.post('/comprar', auth, shopController.comprar);
router.get('/historial', auth, shopController.getHistorial);

module.exports = router;
