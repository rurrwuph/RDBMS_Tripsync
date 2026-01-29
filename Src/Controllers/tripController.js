const db = require('../config/db');

const searchTrips = async (req, res) => {
    const { start, end, date } = req.query;

    if (!start || !end || !date) {
        return res.status(400).json({ error: 'Please provide start, end, and date' });
    }

    try {
        const result = await db.query(
            'SELECT * FROM search_trips($1, $2, $3)',
            [start, end, date]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No trips found for the given criteria' });
        }
        res.status(200).json({
            count: result.rows.length,
            trips: result.rows
        });
    } catch (err) {
        console.error('Search Error:', err);
        res.status(500).json({ error: 'Database error during search' });
    }
};

const assignTrip = async (req, res) => {
    const operatorId = req.user.id;
    const { routeId, busId, tripDate, departureTime, fare } = req.body;

    try {
        await db.query(
            'CALL assign_trip($1, $2, $3, $4, $5, $6)',
            [operatorId, routeId, busId, tripDate, departureTime, fare]
        );
        res.status(201).json({ message: 'Trip assigned successfully' });
    } catch (err) {
        if (err.message.includes('Operator does not own this bus')) {
            return res.status(403).json({ error: 'Security Alert: You do not own this bus' });
        }

        console.error('Assign Trip Error:', err);
        res.status(500).json({ error: 'Database error during trip assignment' });
    }
};

const getOperatorTrips = async (req, res) => {
    const operatorId = req.user.id;
    try {
        const result = await db.query(
            'SELECT * FROM get_operator_trips($1)',
            [operatorId]
        );
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Fetch Operator Trips Error:', err);
        res.status(500).json({ error: 'Database error fetching trips' });
    }
};

const getOperatorStats = async (req, res) => {
    const operatorId = req.user.id;
    try {
        const result = await db.query('SELECT * FROM get_operator_stats($1)', [operatorId]);
        const stats = result.rows[0];

        res.status(200).json({
            totalBuses: parseInt(stats.total_buses),
            activeTrips: parseInt(stats.active_trips),
            todayBookings: 0,
            todayRevenue: 0
        });
    } catch (err) {
        console.error('Fetch Operator Stats Error:', err);
        res.status(500).json({ error: 'Database error fetching stats' });
    }
};

const getRoutes = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM get_all_routes()');
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Fetch Routes Error:', err);
        res.status(500).json({ error: 'Database error fetching routes' });
    }
};

const getTripDetails = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query(
            'SELECT * FROM get_trip_details($1)',
            [id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Trip not found' });
        }

        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Fetch Trip Details Error:', err);
        res.status(500).json({ error: 'Database error fetching trip details' });
    }
};

module.exports = { searchTrips, assignTrip, getOperatorTrips, getOperatorStats, getRoutes, getTripDetails };
