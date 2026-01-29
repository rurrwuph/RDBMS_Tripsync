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
    const { operatorId, routeId, busId, tripDate, departureTime, fare } = req.body;

    // if (!operatorId || !routeId || !busId || !tripDate || !departureTime || !fare) {
    //     return res.status(400).json({ error: 'Please provide all required fields' });
    // }

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

module.exports = { searchTrips, assignTrip };
