const express = require('express');
const router = express.Router();
const { createBooking, getTripSeats } = require('../controllers/bookingController');
const { verifCustomer } = require('../middleware/authMiddleware');

router.get('/seats/:tripId', getTripSeats);
router.post('/book', verifCustomer, createBooking);

module.exports = router;
