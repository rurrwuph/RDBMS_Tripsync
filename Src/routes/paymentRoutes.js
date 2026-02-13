const express = require('express');
const router = express.Router();
const { processPayment } = require('../controllers/processPaymentController');
const { verifCustomer } = require('../middleware/authMiddleware');

router.post('/process', verifCustomer, processPayment);

module.exports = router;