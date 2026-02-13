const db = require('../config/db');

const processPayment = async (req, res) => {
    const { bookingIds, amount, paymentMethod } = req.body;
    const customerId = req.user.id;

    if (!bookingIds || !Array.isArray(bookingIds) || bookingIds.length === 0) {
        return res.status(400).json({ error: "An array of Booking IDs is required." });
    }

    try {
        const result = await db.query(
            'SELECT process_payment_secure($1, $2, $3, $4) as resp',
            [bookingIds, customerId, amount, paymentMethod]
        );

        const { success, message } = result.rows[0].resp;

        if (!success) {
            return res.status(400).json({ error: message });
        }

        res.status(201).json({
            success: true,
            message: message,
            status: "Confirmed"
        });

    } catch (error) {
        console.error('Database Function Error:', error);
        res.status(500).json({ error: 'Internal Database Error' });
    }
};

module.exports = { processPayment };