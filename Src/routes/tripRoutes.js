const express = require('express');
const router = express.Router();
const { searchTrips, assignTrip, getOperatorTrips, getOperatorStats, getRoutes } = require('../controllers/tripController');
const { verifOperator } = require('../middleware/authMiddleware');

router.get('/search', searchTrips);
router.get('/routes', getRoutes);
router.post('/assign', verifOperator, assignTrip);
router.get('/operator-trips', verifOperator, getOperatorTrips);
router.get('/operator-stats', verifOperator, getOperatorStats);

module.exports = router;
