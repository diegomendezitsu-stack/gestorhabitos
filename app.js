const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const { randomUUID } = require('crypto');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const logger = require('./config/logger');

const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir);

const app = express();

// ═══ Request ID ═══
app.use((req, res, next) => {
  req.id = randomUUID();
  res.setHeader('X-Request-Id', req.id);
  next();
});

// ═══ Security ═══
app.use(helmet());

// ═══ Compression ═══
app.use(compression({ filter: (req, res) => {
  if (req.headers['x-no-compression']) return false;
  return compression.filter(req, res);
}}));

// ═══ Rate Limiting ═══
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: { error: 'Demasiadas peticiones. Intenta de nuevo en 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Demasiados intentos de autenticacion. Espera 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// ═══ CORS ═══
const corsOptions = {
  origin: process.env.ALLOWED_ORIGINS
    ? process.env.ALLOWED_ORIGINS.split(',')
    : ['http://localhost:5000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
  maxAge: 86400,
};
app.use(cors(corsOptions));

// ═══ Body parser ═══
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: false, limit: '10kb' }));
app.use(express.static('public', {
  maxAge: process.env.NODE_ENV === 'production' ? '7d' : '0',
  etag: true,
  lastModified: true,
}));

// ═══ Logging ═══
morgan.token('request-id', (req) => req.id || '-');
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, 'logs', 'access.log'),
  { flags: 'a' }
);
app.use(morgan(':method :url :status :res[content-length] - :response-time ms [:request-id]', {
  stream: accessLogStream,
  assignReqId: (req) => req.id,
}));
app.use(morgan('dev'));

// ═══ API Routes ═══
const authRoutes = require('./routes/authRoutes');
const habitRoutes = require('./routes/habitRoutes');
const shopRoutes = require('./routes/shopRoutes');
const statsRoutes = require('./routes/statsRoutes');
const userRoutes = require('./routes/userRoutes');
const resetRoutes = require('./routes/resetRoutes');
const badgesRoutes = require('./routes/badgesRoutes');

app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/auth', resetRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/user', userRoutes);
app.use('/api/badges', badgesRoutes);

// ═══ Health check ═══
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development',
    version: require('./package.json').version,
  });
});

// ═══ 404 API ═══
app.use('/api/{*path}', (req, res) => {
  res.status(404).json({ error: 'Ruta API no encontrada.' });
});

// ═══ 404 Frontend (SPA fallback) ═══
app.get('{*path}', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ═══ Error handler ═══
const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

module.exports = app;
