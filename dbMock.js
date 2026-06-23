// Simulación de las tablas de PostgreSQL en memoria

const usuarios = [
  {
    id: 1,
    nombre: "Jugador Uno",
    email: "prueba@correo.com",
    password: "123",
    nivel: 1,
    xp: 0,
    xp_siguiente_nivel: 100,
    oro: 0
  }
];

const habitos = [
  {
    id: 1,
    usuario_id: 1,
    nombre: "Hacer 20 flexiones",
    dificultad: "MEDIA", // FACIL, MEDIA, DIFICIL
    frecuencia: "DIARIO",
    racha_actual: 0,
    ultima_vez_cumplido: null
  }
];

const recompensas = [];

module.exports = { usuarios, habitos, recompensas };