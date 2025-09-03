const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cron = require('node-cron');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('combined'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Import routes
const hospitalRoutes = require('./routes/hospitals');
const appointmentRoutes = require('./routes/appointments');
const nearbyRoutes = require('./routes/nearby');

// Use routes
app.use('/api/hospitals', hospitalRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/nearby', nearbyRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'MediGuide API is running',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Welcome to MediGuide API',
    version: '1.0.0',
    endpoints: {
      hospitals: '/api/hospitals',
      appointments: '/api/appointments',
      nearby: '/api/nearby',
      health: '/api/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Internal server error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Route not found',
    message: `The route ${req.originalUrl} does not exist`
  });
});

// Scheduled tasks
cron.schedule('0 0 * * *', () => {
  console.log('Running daily maintenance tasks...');
  // Add any daily maintenance tasks here
});

// Start server
app.listen(PORT, () => {
  console.log(`🏥 MediGuide API server is running on port ${PORT}`);
  console.log(`📍 Health check: http://localhost:${PORT}/api/health`);
  console.log(`🌐 API documentation: http://localhost:${PORT}/`);
});

module.exports = app;
