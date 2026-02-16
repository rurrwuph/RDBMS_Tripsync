const db = require('../config/db');

const createBooking = async (req, res) => {

    const customerId = req.user.id;
    const { tripId, seatId } = req.body;


    if (!tripId || !seatId) {
        return res.status(400).json({ error: "Trip ID and Seat ID are required." });
    }

    const seatArray = Array.isArray(seatId) ? seatId : [seatId];

    if (seatArray.length === 0) {
        return res.status(400).json({ error: "At least one seat must be selected." });
    }

    try {
        console.log(`[BOOKING] Attempting to create booking for customer ${customerId}, trip ${tripId}, seats ${seatArray}`);
        console.log(`[BOOKING] Attempting to book seat(s) ${seatArray} for Trip ${tripId}`);
        const result = await db.query(
            'CALL create_booking_bulk($1, $2, $3, NULL)',
            [customerId, tripId, seatArray]
        );

        console.log('Booking Result Rows:', result.rows);
        const createdIds = result.rows[0].p_booking_ids;

        res.status(201).json({
            message: "Seats reserved successfully!",
            bookingId: createdIds
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


const handleCancellationRequest = async (req, res) => {
    const { bookingId } = req.body;
    const customerId = req.user.id;

    try {
        await db.query('CALL cancel_or_request_refund($1, $2)', [bookingId, customerId]);

        const result = await db.query('SELECT BookingStatus FROM BOOKING WHERE BookingID = $1', [bookingId]);
        const status = result.rows[0].bookingstatus;

        res.status(200).json({
            success: true,
            message: status === 'Cancelled'
                ? "Reservation released."
                : "Refund request submitted for review."
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};


const processRefundReview = async (req, res) => {
    const { bookingId, decision } = req.body;
    const operatorId = req.user.id;

    try {
        await db.query('CALL approve_refund($1, $2)', [bookingId, decision]);

        res.status(200).json({
            success: true,
            message: decision ? "Refund approved and ticket cancelled." : "Refund rejected."
        });
    } catch (error) {
        console.error('Review Error:', error);
        res.status(500).json({ error: error.message || "Failed to process review." });
    }
};

module.exports = { createBooking, getTripSeats, handleCancellationRequest, processRefundReview };
