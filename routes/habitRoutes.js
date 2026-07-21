const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habitController');
const auth = require('../middleware/auth');
const { habitRules, idParamRules } = require('../middleware/validate');

router.get('/', auth, habitController.getHabits);
router.post('/', auth, habitRules, habitController.createHabit);
router.put('/:id', auth, idParamRules, habitRules, habitController.updateHabit);
router.delete('/:id', auth, idParamRules, habitController.deleteHabit);
router.post('/:id/complete', auth, idParamRules, habitController.completeHabit);

module.exports = router;
