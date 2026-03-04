const db = require('../config/db');
const bcrypt = require('bcrypt');

const getProfile = async (req, res) => {
    const userId = req.user.id;
    const role = req.user.role;

    try {
        const result = await db.query('SELECT * FROM get_user_profile($1, $2)', [userId, role]);
        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(result.rows[0]);
    } catch (err) {
        console.error('Fetch Profile Error:', err);
        res.status(500).json({ error: 'Database error fetching profile' });
    }

};

// const getMyBookings = async (req, res) => {
//     const customerId = req.user.id;

//     try {
//         const sqlQuery = `
//             SELECT 
//                 STRING_AGG(b.BookingID::text, ', ' ORDER BY b.BookingID) as bookingids,
//                 b.BookingStatus as status, 
//                 b.BookingTime as bookingtime,
//                 t.TripDate as tripdate, t.DepartureTime as departuretime,
//                 r.StartPoint as startpoint, r.EndPoint as endpoint,
//                 bus.BusNumber as busnumber, bus.BusType as bustype,
//                 STRING_AGG(s.SeatNumber, ', ' ORDER BY s.SeatNumber) as seatnumbers,
//                 SUM(t.BaseFare) as totalfare
//             FROM BOOKING b
//             JOIN TRIP t ON b.TripID = t.TripID
//             JOIN ROUTE r ON t.RouteID = r.RouteID
//             JOIN BUS bus ON t.BusID = bus.BusID
//             JOIN SEAT s ON b.SeatID = s.SeatID
//             WHERE b.CustomerID = $1
//             GROUP BY b.TripID, b.BookingStatus, b.BookingTime, t.TripDate, t.DepartureTime, r.StartPoint, r.EndPoint, bus.BusNumber, bus.BusType
//             ORDER BY b.BookingTime DESC;
//         `;

//         const result = await db.query(sqlQuery, [customerId]);
//         res.status(200).json(result.rows);
//     } catch (err) {
//         console.error('Fetch Bookings Error:', err);
//         res.status(500).json({ error: 'Database error fetching bookings' });
//     }
// };

const getMyBookings = async (req, res) => {
    // Assuming 'id' comes from your JWT/Auth middleware
    const customerId = req.user.id;

    try {
        const sqlQuery = `
            SELECT * FROM v_customer_bookings 
            WHERE CustomerID = $1 
            ORDER BY bookingtime DESC;
        `;

        const result = await db.query(sqlQuery, [customerId]);

        // Return the clean rows to the frontend
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Fetch Bookings Error:', err);
        res.status(500).json({ error: 'Database error fetching your bookings' });
    }
};

const changePassword = async (req, res) => {
    const userId = req.user.id;
    const role = req.user.role;
    const { currentPassword, newPassword } = req.body;

    try {
        // Verify current password first
        let sqlQuery;
        if (role === 'customer') {
            sqlQuery = 'SELECT Password_Hash as hash FROM CUSTOMER WHERE CustomerID = $1';
        } else {
            sqlQuery = 'SELECT AdminPassword_Hash as hash FROM OPERATOR WHERE OperatorID = $1';
        }

        const userRes = await db.query(sqlQuery, [userId]);
        if (userRes.rows.length === 0) return res.status(404).json({ error: 'User not found' });

        const isMatch = await bcrypt.compare(currentPassword, userRes.rows[0].hash);
        if (!isMatch) return res.status(401).json({ error: 'Incorrect current password' });

        // Hash new password and update
        const salt = await bcrypt.genSalt(10);
        const hashedNew = await bcrypt.hash(newPassword, salt);

        await db.query('CALL change_password($1, $2, $3)', [userId, role, hashedNew]);
        res.status(200).json({ message: 'Password updated successfully' });
    } catch (err) {
        console.error('Change Password Error:', err);
        res.status(500).json({ error: 'Failed to change password' });
    }
};

const deleteAccount = async (req, res) => {
    const userId = req.user.id;
    const role = req.user.role;

    try {
        await db.query('CALL delete_account($1, $2)', [userId, role]);
        res.status(200).json({ message: 'Account deleted successfully' });
    } catch (err) {
        // Handle FK constraint violation
        if (err.code === '23503') {
            return res.status(400).json({ error: 'Cannot delete account with active dependencies (e.g., booked trips).' });
        }
        console.error('Delete Account Error:', err);
        res.status(500).json({ error: 'Failed to delete account' });
    }
};

const getOperatorComplaints = async (req, res) => {
    const operatorId = req.user.id;

    try {
        const result = await db.query('SELECT * FROM get_operator_complaints($1)', [operatorId]);
        res.status(200).json(result.rows);
    } catch (err) {
        console.error('Fetch Complaints Error:', err);
        res.status(500).json({ error: 'Failed to fetch complaints' });
    }
};

const updateComplaintStatus = async (req, res) => {
    const operatorId = req.user.id;
    const { id } = req.params;
    const { status, actionDescription } = req.body;

    try {
        await db.query('CALL update_complaint_status($1, $2, $3, $4)', [id, operatorId, status, actionDescription]);
        res.status(200).json({ message: 'Complaint status updated' });
    } catch (err) {
        console.error('Update Complaint Error:', err);
        res.status(500).json({ error: 'Failed to update complaint' });
    }
};

module.exports = {
    getProfile,
    getMyBookings,
    changePassword,
    deleteAccount,
    getOperatorComplaints,
    updateComplaintStatus
};
