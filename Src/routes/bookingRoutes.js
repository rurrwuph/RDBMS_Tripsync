const express = require('express');
const router = express.Router();
const { createBooking, getTripSeats, handleCancellationRequest, getOperatorRefunds, processRefundDecision, getPendingOperatorActions } = require('../controllers/bookingController');
const { verifCustomer, verifOperator } = require('../middleware/authMiddleware');

router.get('/seats/:tripId', getTripSeats);
router.post('/book', verifCustomer, createBooking);
router.post('/cancel', verifCustomer, handleCancellationRequest);

router.get('/operator/pending-actions', verifOperator, getPendingOperatorActions);
router.get('/operator/refund-requests', verifOperator, getOperatorRefunds);
router.post('/operator/process-refund', verifOperator, processRefundDecision);
router.put('/:bookingId/status', verifOperator, processRefundDecision);

module.exports = router;
