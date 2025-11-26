require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const enrollRoute = require('./routes/enroll');
const verifyRoute = require('./routes/verify');
const retrieveRoute = require('./routes/retrieve');
const jwksRoute = require('./routes/jwks');

const app = express();

// Middlewares
app.use(helmet());
app.use(cors());
app.use(express.json());

// Request logging middleware (development only)
const isDevelopment = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
if (isDevelopment) {
  app.use((req, res, next) => {
    const timestamp = new Date().toISOString();
    console.log(`\n[${timestamp}] ${req.method} ${req.path}`);
    console.log('Headers:', JSON.stringify(req.headers, null, 2));
    
    // Log request body (mask sensitive fields)
    if (req.body && Object.keys(req.body).length > 0) {
      const logBody = { ...req.body };
      if (logBody.nfc_token) {
        logBody.nfc_token = logBody.nfc_token.substring(0, 8) + '***';
      }
      if (logBody.phone_last4) {
        logBody.phone_last4 = '****';
      }
      if (logBody.customer_phone_last4) {
        logBody.customer_phone_last4 = '****';
      }
      console.log('Request Body:', JSON.stringify(logBody, null, 2));
    }
    
    // Log query parameters
    if (req.query && Object.keys(req.query).length > 0) {
      console.log('Query Params:', JSON.stringify(req.query, null, 2));
    }
    
    // Log response
    const originalSend = res.send;
    res.send = function(data) {
      console.log(`[${new Date().toISOString()}] Response ${res.statusCode}:`, 
        typeof data === 'string' ? data.substring(0, 200) : JSON.stringify(data).substring(0, 200));
      return originalSend.call(this, data);
    };
    
    next();
  });
}

// Rate limiting - 100 requests per hour per IP
const limiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 100
});
app.use(limiter);

// Routes
app.use('/enroll', enrollRoute);
app.use('/verify', verifyRoute);
app.use('/retrieve', retrieveRoute);
app.use('/.well-known', jwksRoute);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

module.exports = app;

