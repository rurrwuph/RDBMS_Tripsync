const db = require('../config/db');

const createBooking = async (req, res) => {

    const customerId = req.user.id;
    const { tripId, seatId } = req.body;

    if (!tripId || !seatId) {
        return res.status(400).json({ error: "Trip ID and Seat ID are required." });
    }


    try {
        const result = await db.query(
            'CALL create_booking($1, $2, $3, NULL)',
            [customerId, tripId, seatId]
        );

        res.status(201).json({
            message: "Booking confirmed successfully!",
            bookingId: result.rows[0].p_booking_id
        });

    } catch (err) {
        if (err.message.includes('Constraint Violation') || err.code === '23505') {
            return res.status(409).json({
                error: "Seat Already Booked",
                message: "This seat has already been reserved. Please refresh and try another."
            });
        }

        console.error('Booking Error:', err);
        res.status(500).json({ error: "Internal server error." });
    }

};

const getTripSeats = async (req, res) => {
    const { tripId } = req.params;

    try {
        const result = await db.query('SELECT * FROM get_trip_seat_map($1)', [tripId]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: "No seats found for this trip." });
        }

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Fetch Trip Seats Error:', err);
        res.status(500).json({ error: "Internal server error fetching seat map." });
    }
};

module.exports = { createBooking, getTripSeats };
