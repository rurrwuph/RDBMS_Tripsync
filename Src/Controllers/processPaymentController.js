const db = require('../config/db');

const processPayment = async (req, res) => {
    const { bookingId, amount, paymentMethod } = req.body;

    if (!bookingId || !amount || !paymentMethod) {
        return res.status(400).json({ error: "Missing payment details." });
    }

    try {
        const result = await db.query(
            'CALL complete_booking_payment($1, $2, $3, NULL)',
            [bookingId, amount, paymentMethod]
        );

        res.status(201).json({
            message: "Payment successful!",
            paymentId: result.rows[0].p_payment_id,
            status: "Ticket Confirmed"
        });

    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ success: false, message: 'Payment processing failed' });
    }
}

module.exports = { processPayment };