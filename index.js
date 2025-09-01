require('dotenv').config();
const express = require('express');
const rateLimit = require('express-rate-limit');

const app = express();
app.use(express.json());

// Basic Authentication Middleware
const basicAuth = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    res.setHeader('WWW-Authenticate', 'Basic realm="Library API"');
    return res.status(401).send('Authentication required.');
  }

  const base64Credentials = authHeader.split(' ')[1];
  const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
  const [username, password] = credentials.split(':');

  const USER = process.env.API_USER || 'admin';
  const PASS = process.env.API_PASS || 'admin123';

  if (username === USER && password === PASS) {
    next();
  } else {
    res.setHeader('WWW-Authenticate', 'Basic realm="Library API"');
    return res.status(401).send('Invalid credentials.');
  }
};

// Apply Basic Auth globally
app.use(basicAuth);

// Rate Limiting for specific endpoints
const booksLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per window
  message: { error: 'Too many requests, please try again later.' }
});

const borrowLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { error: 'Too many requests, please try again later.' }
});

// Apply rate limiting to selected routes
const booksRoutes = require('./routes/books');
const borrowersRoutes = require('./routes/borrowers');
const borrowRoutes = require('./routes/borrow');
const reportsRoutes = require('./routes/reports');

app.use('/books', booksLimiter, booksRoutes);
app.use('/borrowers', borrowersRoutes);
app.use('/borrow', borrowLimiter, borrowRoutes);
app.use('/reports', reportsRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Library system API running at http://localhost:${PORT}`);
});
