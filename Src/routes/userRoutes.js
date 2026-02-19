const express = require('express');
const router = express.Router();
const { getProfile, getMyBookings } = require('../controllers/userController');
const { verifCustomer, verifAnyUser } = require('../middleware/authMiddleware');

router.get('/profile', verifAnyUser, getProfile);
router.get('/my-bookings', verifCustomer, getMyBookings);

module.exports = router;
