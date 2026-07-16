-- Esquema de base de datos para Gestor de Hábitos

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id SERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    email VARCHAR(150) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    nivel INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    xp_siguiente_nivel INTEGER DEFAULT 100,
    oro INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de hábitos
CREATE TABLE IF NOT EXISTS habitos (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    nombre VARCHAR(200) NOT NULL,
    dificultad VARCHAR(20) CHECK (dificultad IN ('FACIL', 'MEDIA', 'DIFICIL')) DEFAULT 'FACIL',
    frecuencia VARCHAR(20) CHECK (frecuencia IN ('DIARIO', 'SEMANAL', 'MENSUAL')) DEFAULT 'DIARIO',
    racha_actual INTEGER DEFAULT 0,
    ultima_vez_cumplido TIMESTAMP,
    activo BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de transacciones de la tienda
CREATE TABLE IF NOT EXISTS transacciones_tienda (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    producto VARCHAR(200) NOT NULL,
    costo INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Tabla de historial de niveles (log de level ups)
CREATE TABLE IF NOT EXISTS nivel_historial (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    nivel_anterior INTEGER NOT NULL,
    nivel_nuevo INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Los datos iniciales se insertan con: node scripts/init-db.js