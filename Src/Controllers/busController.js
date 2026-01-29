const db = require('../config/db');

const addBus = async (req, res) => {

    const operatorId = req.user.id;
    const { busNumber, busType, totalSeats } = req.body;

    if (!busNumber || !busType || !totalSeats) {
        return res.status(400).json({ error: 'Please provide all required fields' });
    }

    try {
        const result = await db.query(
            'CALL add_bus($1, $2, $3, $4, NULL)',
            [operatorId, busNumber, busType, totalSeats]
        );

        res.status(201).json({
            message: "Bus registered successfully",
            busId: result.rows[0].p_bus_id,
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
            'SELECT * FROM get_operator_buses($1)',
            [operatorId]
        );
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Fetch Operator Buses Error:', err);
        res.status(500).json({ error: 'Database error fetching buses' });
    }
};

module.exports = { addBus, getOperatorBuses };
