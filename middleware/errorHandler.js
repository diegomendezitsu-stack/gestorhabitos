const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  logger.error(`${err.message}`, { stack: err.stack, url: req.originalUrl, method: req.method });

  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'JSON mal formado.' });
  }

  if (err.code === '23505') {
    return res.status(409).json({ error: 'Registro duplicado.' });
  }

  if (err.code === '23503') {
    return res.status(400).json({ error: 'Referencia no válida.' });
  }

  if (err.code === '22P02') {
    return res.status(400).json({ error: 'Formato de dato no válido.' });
  }

  res.status(err.status || 500).json({
    error: err.message || 'Error interno del servidor.',
  });
};

module.exports = errorHandler;
