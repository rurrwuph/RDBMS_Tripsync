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
        const result = await db.query(
            'CALL create_booking_bulk($1, $2, $3, NULL)',
            [customerId, tripId, seatArray]
        );

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


const getOperatorRefunds = async (req, res) => {
    const operatorId = req.user.id;
    try {
        const result = await db.query(`
            SELECT * FROM v_operator_refunds 
            WHERE operatorid = $1 
            ORDER BY requestedat DESC
        `, [operatorId]);

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Fetch Refunds Error:', err);
        res.status(500).json({ error: "Failed to fetch refund requests." });
    }
};

const processRefundDecision = async (req, res) => {
    const { refundId, decision } = req.body; // decision: 'Approved' or 'Rejected'
    const operatorId = req.user.id;

    try {
        // Procedure: handle_refund_decision(p_refund_id, p_operator_id, p_decision)
        await db.query('CALL handle_refund_decision($1, $2, $3)', [refundId, operatorId, decision]);

        res.status(200).json({
            success: true,
            message: `Refund request ${decision.toLowerCase()} successfully.`
        });
    } catch (err) {
        console.error('Refund Decision Error:', err);
        res.status(500).json({ error: err.message || "Failed to process refund decision." });
    }
};

const getPendingOperatorActions = async (req, res) => {
    const operatorId = req.user.id;
    try {
        const result = await db.query(`
            SELECT 
                b.TripID as tripid,
                STRING_AGG(b.BookingID::text, ', ') as bookingids,
                b.PaymentID as paymentid,
                c.FullName as customername,
                STRING_AGG(s.SeatNumber, ', ') as seatnumbers,
                b.BookingStatus as status
            FROM BOOKING b
            JOIN TRIP t ON b.TripID = t.TripID
            JOIN CUSTOMER c ON b.CustomerID = c.CustomerID
            JOIN SEAT s ON b.SeatID = s.SeatID
            WHERE t.OperatorID = $1
            AND b.BookingStatus IN ('Pending', 'RefundRequested')
            GROUP BY b.TripID, b.PaymentID, c.FullName, b.BookingStatus, b.BookingTime
            ORDER BY b.BookingTime DESC
        `, [operatorId]);

        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Fetch Pending Actions Error:', err);
        res.status(500).json({ error: "Internal server error fetching pending actions." });
    }
};

module.exports = {
    createBooking,
    getTripSeats,
    handleCancellationRequest,
    getPendingOperatorActions,
    getOperatorRefunds,
    processRefundDecision
};
