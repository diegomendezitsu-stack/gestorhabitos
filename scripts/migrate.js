const pool = require('../config/db');

const MIGRATIONS = [
  'ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS avatar VARCHAR(10) DEFAULT \'🧙‍♂️\'',
  'ALTER TABLE habitos ADD COLUMN IF NOT EXISTS categoria VARCHAR(50) DEFAULT \'general\'',
  'ALTER TABLE habitos ADD COLUMN IF NOT EXISTS mejor_racha INTEGER DEFAULT 0',
];

async function migrate() {
  for (const sql of MIGRATIONS) {
    try {
      await pool.query(sql);
      console.log('OK:', sql.substring(0, 60) + '...');
    } catch (err) {
      console.error('ERROR:', sql.substring(0, 60) + '...', err.message);
    }
  }
  await pool.end();
  console.log('Migraciones completadas.');
}

migrate();
