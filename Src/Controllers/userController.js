const db = require('../config/db');

const getProfile = async (req, res) => {
    const userId = req.user.id;
    const role = req.user.role;

    try {
        let sqlQuery;
        if (role === 'customer') {
            sqlQuery = 'SELECT CustomerID as id, FullName as name, Email as email, Phone as phone, CreatedAt as joined FROM CUSTOMER WHERE CustomerID = $1';
        } else {
            sqlQuery = 'SELECT OperatorID as id, CompanyName as name, AdminEmail as email, Status as status FROM OPERATOR WHERE OperatorID = $1';
        }

        const result = await db.query(sqlQuery, [userId]);
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

module.exports = { getProfile, getMyBookings };
