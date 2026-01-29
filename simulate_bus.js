const db = require('./src/config/db');

async function simulateAdd() {
    try {
        console.log('Simulating addition of Bus DH-9999...');
        const result = await db.query(
            'INSERT INTO BUS (OperatorID, BusNumber, BusType, TotalSeats) VALUES ($1, $2, $3, $4) RETURNING *',
            [1, 'DH-9999', 'Sleeper', 30]
        );
        console.log('Bus Added Successfully:', result.rows[0]);

        const seatCount = await db.query('SELECT COUNT(*) FROM SEAT WHERE BusID = $1', [result.rows[0].busid]);
        console.log('Seats Created:', seatCount.rows[0].count);

        // Cleanup
        await db.query('DELETE FROM BUS WHERE BusID = $1', [result.rows[0].busid]);
        console.log('Cleanup complete.');

    } catch (err) {
        console.error('SIMULATION ERROR:', err);
    } finally {
        process.exit(0);
    }
}

simulateAdd();
