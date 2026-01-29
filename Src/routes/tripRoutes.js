const express = require('express');
const router = express.Router();
const { searchTrips, assignTrip } = require('../controllers/tripController');

router.get('/search', searchTrips);


module.exports = router;
