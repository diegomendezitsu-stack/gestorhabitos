const { Pool } = require('pg');
const logger = require('./logger');
require('dotenv').config();

const pool = new Pool({
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  ssl: {
    rejectUnauthorized: false
  }
});

pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    logger.error('Error al conectar a Supabase PostgreSQL:', err.stack);
  } else {
    logger.info('Conexion exitosa a Supabase PostgreSQL:', res.rows[0].now);
  }
});

module.exports = pool;
