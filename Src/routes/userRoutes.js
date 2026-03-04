const express = require('express');
const router = express.Router();
const { getProfile, getMyBookings, changePassword, deleteAccount, getOperatorComplaints, updateComplaintStatus } = require('../controllers/userController');
const { verifCustomer, verifAnyUser, verifOperator } = require('../middleware/authMiddleware');

router.get('/profile', verifAnyUser, getProfile);
router.get('/my-bookings', verifCustomer, getMyBookings);
router.put('/change-password', verifAnyUser, changePassword);
router.delete('/account', verifAnyUser, deleteAccount);

router.get('/operator/complaints', verifOperator, getOperatorComplaints);
router.put('/operator/complaints/:id/status', verifOperator, updateComplaintStatus);

module.exports = router;
