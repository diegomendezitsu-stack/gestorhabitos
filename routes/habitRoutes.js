const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habitController');
const auth = require('../middleware/auth');

router.get('/', auth, habitController.getHabits);
router.post('/', auth, habitController.createHabit);
router.put('/:id', auth, habitController.updateHabit);
router.delete('/:id', auth, habitController.deleteHabit);
router.post('/:id/complete', auth, habitController.completeHabit);

module.exports = router;
