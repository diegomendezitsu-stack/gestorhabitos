-- Esquema de base de datos para Gestor de Hábitos

-- Tabla de usuarios
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
    reset_token VARCHAR(255),
    reset_token_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Tabla de hábitos
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

-- Tabla de completaciones de hábitos
CREATE TABLE IF NOT EXISTS completaciones (
    id SERIAL PRIMARY KEY,
    habito_id INTEGER NOT NULL,
    usuario_id INTEGER NOT NULL,
    completado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (habito_id) REFERENCES habitos(id) ON DELETE CASCADE,
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

-- Tabla de logros desbloqueados
CREATE TABLE IF NOT EXISTS logros (
    id SERIAL PRIMARY KEY,
    usuario_id INTEGER NOT NULL,
    logro_id VARCHAR(50) NOT NULL,
    desbloqueado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(usuario_id, logro_id),
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id) ON DELETE CASCADE
);

-- Índices para rendimiento
CREATE INDEX IF NOT EXISTS idx_habitos_usuario_id ON habitos(usuario_id);
CREATE INDEX IF NOT EXISTS idx_habitos_usuario_activo ON habitos(usuario_id, activo);
CREATE INDEX IF NOT EXISTS idx_completaciones_usuario_fecha ON completaciones(usuario_id, completado_en);
CREATE INDEX IF NOT EXISTS idx_completaciones_habito ON completaciones(habito_id);
CREATE INDEX IF NOT EXISTS idx_transacciones_usuario_id ON transacciones_tienda(usuario_id);
CREATE INDEX IF NOT EXISTS idx_nivel_historial_usuario_id ON nivel_historial(usuario_id);
CREATE INDEX IF NOT EXISTS idx_logros_usuario ON logros(usuario_id);

-- Los datos iniciales se insertan con: node scripts/init-db.js