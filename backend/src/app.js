const express = require('express');
const cors = require('cors');
const path = require('path');
const session = require('express-session');
const authRoutes = require('./routes/authRoutes');
const orgRoutes = require('./routes/orgRoutes');
const assetRoutes = require('./routes/assetRoutes');
const allocationRoutes = require('./routes/allocationRoutes');
const bookingRoutes = require('./routes/bookingRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const auditRoutes = require('./routes/auditRoutes');
const reportRoutes = require('./routes/reportRoutes');

const app = express();

// Trust proxy (crucial for secure cookies behind reverse proxies like Render/Heroku load balancers)
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// Load Environment Configuration
const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://127.0.0.1:5173').split(',');

// Global Middleware Configuration
app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    if (process.env.NODE_ENV === 'production' || allowedOrigins.indexOf(origin) !== -1) {
      return callback(null, true);
    }
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session Configuration Middleware
app.use(session({
  secret: process.env.SESSION_SECRET || 'assetflow_fallback_dev_session_secret_key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Serve Uploads Directory Static Assets
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Register Auth Routes
app.use('/api', authRoutes);
app.use('/api', orgRoutes);
app.use('/api', assetRoutes);
app.use('/api', allocationRoutes);
app.use('/api', bookingRoutes);
app.use('/api', maintenanceRoutes);
app.use('/api', dashboardRoutes);
app.use('/api', auditRoutes);
app.use('/api', reportRoutes);

// Health Check API Endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    env: process.env.NODE_ENV || 'development'
  });
});

// Root API Endpoint
app.get('/api', (req, res) => {
  res.status(200).json({
    message: 'Welcome to the AssetFlow Enterprise Resource Management API',
    version: '1.0.0'
  });
});

// Fallback Route for Undefined API Paths
app.use('/api/*', (req, res, next) => {
  const err = new Error('API Endpoint Not Found');
  err.status = 404;
  next(err);
});

// Global Error Handling Middleware
app.use((err, req, res, next) => {
  const statusCode = err.status || 500;
  res.status(statusCode).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: statusCode,
      timestamp: new Date().toISOString()
    }
  });
});

module.exports = app;
