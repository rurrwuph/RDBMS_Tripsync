const db = require('./src/config/db');

async function testDuplicate() {
    try {
        console.log('Attempting to add duplicate bus GL-001...');
        const result = await db.query(
            'INSERT INTO BUS (OperatorID, BusNumber, BusType, TotalSeats) VALUES ($1, $2, $3, $4)',
            [1, 'GL-001', 'AC', 36]
        );
        console.log('Success (Unexpected!):', result.rows);
    } catch (err) {
        console.log('Caught Expected Error:');
        console.log('Code:', err.code);
        console.log('Message:', err.message);
    } finally {
        process.exit(0);
    }
}

testDuplicate();
