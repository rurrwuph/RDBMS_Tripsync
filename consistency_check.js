const db = require('./src/config/db');

async function run() {
    try {
        const result = await db.query(`
            SELECT b.BusID, b.BusNumber, b.TotalSeats, COUNT(s.SeatID) as ActualSeats
            FROM BUS b
            LEFT JOIN SEAT s ON b.BusID = s.BusID
            GROUP BY b.BusID, b.BusNumber, b.TotalSeats
            ORDER BY b.BusID
        `);
        console.log('--- Bus Seat Consistency ---');
        console.table(result.rows);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

run();
