const express = require('express');
const router = express.Router();
const habitController = require('../controllers/habitController');

router.get('/', habitController.getHabits);
router.post('/', habitController.createHabit);
router.post('/:id/complete', habitController.completeHabit);

module.exports = router;