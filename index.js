const app = require('./app');
const logger = require('./config/logger');
const pool = require('./config/db');

const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
  logger.info(`Servidor corriendo en el puerto ${PORT} [${process.env.NODE_ENV || 'development'}]`);
});

function shutdown(signal) {
  logger.info(`${signal} recibido. Cerrando servidor gracefully...`);
  server.close(async () => {
    logger.info('Servidor HTTP cerrado.');
    try {
      await pool.end();
      logger.info('Pool de base de datos cerrado.');
    } catch (e) {
      logger.error('Error cerrando pool:', e.message);
    }
    process.exit(0);
  });

  setTimeout(() => {
    logger.error('Forzando cierre del servidor.');
    process.exit(1);
  }, 10000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled Rejection:', reason);
});

process.on('uncaughtException', (err) => {
  logger.error('Uncaught Exception:', err);
  shutdown('uncaughtException');
});
