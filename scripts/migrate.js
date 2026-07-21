const pool = require('../config/db');

const MIGRATIONS = [
  `CREATE TABLE IF NOT EXISTS completaciones (
    id SERIAL PRIMARY KEY,
    habito_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    completado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (habito_id) REFERENCES habitos(id) ON DELETE CASCADE,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  )`,
  'ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS reset_token VARCHAR(255)',
  'ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP',
  `CREATE TABLE IF NOT EXISTS logros (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    logro_id VARCHAR(50) NOT NULL,
    desbloqueado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, logro_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  )`,
  'CREATE INDEX IF NOT EXISTS idx_habitos_usuario_id ON habitos(usuario_id)',
  'CREATE INDEX IF NOT EXISTS idx_habitos_usuario_activo ON habitos(usuario_id, activo)',
  'CREATE INDEX IF NOT EXISTS idx_completaciones_usuario_fecha ON completaciones(usuario_id, completado_en)',
  'CREATE INDEX IF NOT EXISTS idx_completaciones_habito ON completaciones(habito_id)',
  'CREATE INDEX IF NOT EXISTS idx_transacciones_usuario_id ON transacciones_tienda(usuario_id)',
  'CREATE INDEX IF NOT EXISTS idx_nivel_historial_usuario_id ON nivel_historial(usuario_id)',
  'CREATE INDEX IF NOT EXISTS idx_logros_usuario ON logros(usuario_id)',
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
