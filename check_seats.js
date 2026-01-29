const db = require('./src/config/db');

async function run() {
    try {
        const result = await db.query('SELECT BusID, COUNT(*) FROM SEAT GROUP BY BusID');
        console.log('--- Seats per Bus ---');
        console.table(result.rows);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

run();
