const db = require('./src/config/db');

async function run() {
    try {
        const result = await db.query('SELECT BusID, BusNumber, OperatorID FROM BUS ORDER BY BusID');
        console.log('--- Current Buses ---');
        console.table(result.rows);
        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

run();
