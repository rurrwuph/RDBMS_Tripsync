const db = require('./src/config/db');

async function run() {
    try {
        const busCount = await db.query('SELECT COUNT(*) FROM BUS');
        const seatCount = await db.query('SELECT COUNT(*) FROM SEAT');
        const operators = await db.query('SELECT OperatorID, CompanyName FROM OPERATOR');

        console.log('--- Database Diagnostic ---');
        console.log('Total Buses:', busCount.rows[0].count);
        console.log('Total Seats:', seatCount.rows[0].count);
        console.log('Operators:', operators.rows);

        process.exit(0);
    } catch (err) {
        console.error('Diagnostic Error:', err);
        process.exit(1);
    }
}

run();
