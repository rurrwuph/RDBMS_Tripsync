const db = require('../config/db');

const addBus = async (req, res) => {

    const operatorId = req.user.id;
    const { busNumber, busType, totalSeats } = req.body;

    if (!busNumber || !busType || !totalSeats) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }

    try {
        const result = await db.query(
            `INSERT INTO BUS (OperatorID, BusNumber, BusType, TotalSeats) 
             VALUES ($1, $2, $3, $4) RETURNING *`,
            [operatorId, busNumber, busType, totalSeats]
        );

        const newBus = result.rows[0];
        res.status(201).json({
            message: "Bus registered successfully",
            bus: newBus,
            info: `Database trigger has automatically generated ${totalSeats} seats.`
        });
    } catch (err) {
        console.error('Add Bus Error:', err);
        res.status(500).json({ error: 'Database error during bus addition' });
    }
};

module.exports = { addBus };
