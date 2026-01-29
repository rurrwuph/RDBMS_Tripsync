const express = require('express');
const router = express.Router();
const { addBus } = require('../controllers/busController');
const { verifOperator } = require('../middleware/authMiddleware');

router.post('/add', verifOperator, addBus);

module.exports = router;