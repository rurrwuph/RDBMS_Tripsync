const express = require('express');
const cors = require('cors');
const db = require('./src/config/db');
require('dotenv').config();
const authRoutes = require('./src/routes/authRoutes');
const tripRoutes = require('./src/routes/tripRoutes');
const busRoutes = require('./src/routes/busRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/bookings', bookingRoutes);

app.get('/api/health', async (req, res) => {
  try {
    const result = await db.query('SELECT NOW()');
    res.status(200).json({
      status: 'TripSync API is active',
      database: 'Connected to Neon',
      server_time: result.rows[0].now
    });
  } catch (err) {
    res.status(500).json({
      status: 'Error',
      message: 'Database connection failed',
      details: err.message
    });
  }
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke!');
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`TripSync Backend active on port ${PORT}`);
});