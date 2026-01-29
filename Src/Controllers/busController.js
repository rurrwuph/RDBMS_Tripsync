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
        console.error('ADD BUS ERROR FULL:', err);

        let errorMsg = 'Database error during bus addition';
        if (err.code === '23505') {
            errorMsg = 'A bus with this number already exists.';
        } else if (err.code === '23514') {
            errorMsg = 'Check constraint violation. Please verify bus type or seats.';
        }

        res.status(500).json({
            error: errorMsg,
            details: err.message,
            code: err.code
        });
    }
};

const getOperatorBuses = async (req, res) => {
    const operatorId = req.user.id;
    try {
        const result = await db.query(
            'SELECT * FROM BUS WHERE OperatorID = $1 ORDER BY BusID DESC',
            [operatorId]
        );
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Fetch Operator Buses Error:', err);
        res.status(500).json({ error: 'Database error fetching buses' });
    }
};

module.exports = { addBus, getOperatorBuses };
