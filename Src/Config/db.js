const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  }
});


const testDb = async () => {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('Connected to Neon PostgreSQL at:', res.rows[0].now);
  } catch (err) {
    console.error('Database Connection Error:', err.message);
  }
};

testDb();

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};