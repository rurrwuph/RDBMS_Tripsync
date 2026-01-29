const express = require('express');
const router = express.Router();
const { addBus, getOperatorBuses } = require('../controllers/busController');
const { verifOperator } = require('../middleware/authMiddleware');

router.post('/add', verifOperator, addBus);
router.get('/operator-list', verifOperator, getOperatorBuses);

module.exports = router;