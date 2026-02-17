const express = require('express');
const router = express.Router();
const { createBooking, getTripSeats, handleCancellationRequest, processRefundReview, getPendingOperatorActions } = require('../controllers/bookingController');
const { verifCustomer, verifOperator } = require('../middleware/authMiddleware');

router.get('/seats/:tripId', getTripSeats);
router.post('/book', verifCustomer, createBooking);
router.post('/cancel', verifCustomer, handleCancellationRequest);
router.get('/operator/pending-actions', verifOperator, getPendingOperatorActions);
router.post('/review-refund', verifOperator, processRefundReview);

module.exports = router;
