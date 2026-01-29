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

