require('./src/utils/logger');
const express = require('express');
const cors = require('cors');
const db = require('./src/config/db');
require('dotenv').config();
const authRoutes = require('./src/routes/authRoutes');
const tripRoutes = require('./src/routes/tripRoutes');
const busRoutes = require('./src/routes/busRoutes');
const bookingRoutes = require('./src/routes/bookingRoutes');
const paymentRoutes = require('./src/routes/paymentRoutes');
const userRoutes = require('./src/routes/userRoutes');

const app = express();

app.use(cors());
app.use(express.json());

app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

app.use('/api/auth', authRoutes);
app.use('/api/trips', tripRoutes);
app.use('/api/buses', busRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/users', userRoutes);


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

const { execSync } = require('child_process');
const PORT = process.env.PORT || 8000;

try {
  if (process.platform === 'win32') {
    const output = execSync(`netstat -ano | findstr :${PORT}`, { encoding: 'utf-8' });
    const lines = output.trim().split('\n');
    for (const line of lines) {
      if (line.includes('LISTENING')) {
        const pid = line.trim().split(/\s+/).pop();
        if (pid && pid !== '0') {
          console.log(`Killing existing process ${pid} on port ${PORT}...`);
          try { execSync(`taskkill /F /PID ${pid}`); } catch (e) { }
        }
      }
    }
  } else {
    try { execSync(`lsof -i :${PORT} -t | xargs kill -9`); } catch (e) { }
  }
} catch (e) {
  // Ignore errors if no process is found on the port
}

const server = app.listen(PORT, () => {
  console.log(`TripSync Backend active on port ${PORT}`);
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`Port ${PORT} is already in use. Please close other instances.`);
    process.exit(1);
  } else {
    console.error('Server error:', err);
  }
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception thrown:', err);
});

process.on('exit', (code) => {
  console.log(`Process exiting with code: ${code}`);
});

// Keep process alive
setInterval(() => { }, 1000 * 60 * 60);