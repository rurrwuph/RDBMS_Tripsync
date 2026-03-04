const express = require('express');
const router = express.Router();
const { searchTrips, assignTrip, getOperatorTrips, getOperatorPastTrips, getOperatorStats, getRoutes, getTripDetails, getOperatorAnalytics, updateTrip, deleteTrip } = require('../controllers/tripController');
const { verifOperator } = require('../middleware/authMiddleware');

router.get('/search', searchTrips);
router.get('/routes', getRoutes);
router.post('/assign', verifOperator, assignTrip);
router.get('/operator-stats', verifOperator, getOperatorStats);
router.get('/operator-trips', verifOperator, getOperatorTrips);
router.get('/operator-past-trips', verifOperator, getOperatorPastTrips);
router.get('/operator-analytics', verifOperator, getOperatorAnalytics);
router.put('/:id', verifOperator, updateTrip);
router.delete('/:id', verifOperator, deleteTrip);
router.get('/:id', getTripDetails);


module.exports = router;
