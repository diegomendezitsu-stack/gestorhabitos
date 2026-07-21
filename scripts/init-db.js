const pool = require('../config/db');
const bcrypt = require('bcrypt');

const SCHEMA = `
  CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    avatar VARCHAR(10) DEFAULT '🧙‍♂️',
    nivel INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    xp_siguiente_nivel INTEGER DEFAULT 100,
    oro INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS habitos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    categoria VARCHAR(50) DEFAULT 'general',
    dificultad VARCHAR(20) CHECK (dificultad IN ('FACIL', 'MEDIA', 'DIFICIL')) DEFAULT 'FACIL',
    frecuencia VARCHAR(20) CHECK (frecuencia IN ('DIARIO', 'SEMANAL', 'MENSUAL')) DEFAULT 'DIARIO',
    racha_actual INTEGER DEFAULT 0,
    mejor_racha INTEGER DEFAULT 0,
    ultima_vez_cumplido TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS transacciones_tienda (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    producto VARCHAR(200) NOT NULL,
    costo INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );

  CREATE TABLE IF NOT EXISTS nivel_historial (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    nivel_anterior INTEGER NOT NULL,
    nivel_nuevo INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
  );

  ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS avatar VARCHAR(10) DEFAULT '🧙‍♂️';
  ALTER TABLE habitos ADD COLUMN IF NOT EXISTS categoria VARCHAR(50) DEFAULT 'general';
  ALTER TABLE habitos ADD COLUMN IF NOT EXISTS mejor_racha INTEGER DEFAULT 0;
`;

async function initDB() {
  try {
    console.log('Conectando a Supabase PostgreSQL...');
    await pool.query('SELECT NOW()');
    console.log('Conexion exitosa.\n');

    console.log('Creando tablas...');
    await pool.query(SCHEMA);
    console.log('Tablas creadas correctamente.\n');

    console.log('Insertando usuario por defecto...');
    const hashedPassword = await bcrypt.hash('123', 10);
    await pool.query(
      `INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3)
       ON CONFLICT (email) DO NOTHING`,
      ['Jugador Uno', 'prueba@correo.com', hashedPassword]
    );
    console.log('Usuario por defecto listo.');
    console.log('  Email:    prueba@correo.com');
    console.log('  Password: 123\n');

    console.log('Insertando habito de ejemplo...');
    await pool.query(
      `INSERT INTO habitos (usuario_id, nombre, dificultad, frecuencia)
       SELECT 1, 'Hacer 20 flexiones', 'MEDIA', 'DIARIO'
       WHERE NOT EXISTS (SELECT 1 FROM habitos WHERE usuario_id = 1 LIMIT 1)`
    );
    console.log('Habito de ejemplo listo.\n');

    console.log('========================================');
    console.log(' Base de datos inicializada en Supabase!');
    console.log('========================================');
    process.exit(0);
  } catch (error) {
    console.error('Error al inicializar:', error.message);
    process.exit(1);
  }
}

initDB();
