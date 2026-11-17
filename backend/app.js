const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { errorHandler, notFound } = require('./middleware/errorHandler');

const app = express();

const allowedOrigins = (process.env.FRONTEND_URL || 'http://localhost:5173')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use('/uploads', express.static(process.env.UPLOADS_DIR || path.join(__dirname, 'uploads'), {
  dotfiles: 'deny',
  index: false,
  maxAge: '1d',
  setHeaders: (res) => res.setHeader('X-Content-Type-Options', 'nosniff'),
}));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { success: false, message: 'Too many requests. Please try again later.' },
});
const submissionLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  message: { success: false, message: 'Too many submissions. Please wait before trying again.' },
});

app.use('/api/', limiter);
app.use('/api/enquiries', submissionLimiter);
app.use('/api/custom-requests', submissionLimiter);
app.use('/api/admin/auth/login', rateLimit({ windowMs: 15 * 60 * 1000, max: 10 }));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

if (process.env.NODE_ENV === 'development') app.use(morgan('dev'));

app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Shreeji Impex API is running.',
    database: require('mongoose').connection.readyState === 1 ? 'connected' : 'disconnected',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/admin/auth', require('./routes/authRoutes'));
app.use('/api/designs', require('./routes/designRoutes'));
app.use('/api/categories', require('./routes/categoryRoutes'));
app.use('/api/gallery', require('./routes/galleryRoutes'));
app.use('/api/enquiries', require('./routes/enquiryRoutes'));
app.use('/api/custom-requests', require('./routes/customRequestRoutes'));
app.use('/api/content', require('./routes/contentRoutes'));
app.use('/api/manufacturing', require('./routes/manufacturingRoutes'));

app.use(notFound);
app.use(errorHandler);

module.exports = app;
