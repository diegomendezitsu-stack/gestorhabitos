// Importamos nuestros datos simulados
const db = require('../dbMock');

// 1. Obtener todos los hábitos
exports.getHabits = (req, res) => {
  res.json(db.habitos);
};

// 2. Crear un nuevo hábito
exports.createHabit = (req, res) => {
  const { nombre, dificultad, frecuencia } = req.body;

  if (!nombre || !dificultad) {
    return res.status(400).json({ error: "Faltan campos obligatorios" });
  }

  const nuevoHabito = {
    id: db.habitos.length + 1,
    usuario_id: 1, // Atado al usuario 1 por ahora
    nombre,
    dificultad: dificultad.toUpperCase(),
    frecuencia: frecuencia || "DIARIO",
    racha_actual: 0,
    ultima_vez_cumplido: null
  };

  db.habitos.push(nuevoHabito);
  res.status(201).json(nuevoHabito);
};

// 3. Completar un hábito y ganar recompensas (Gamificación)
exports.completeHabit = (req, res) => {
  const { id } = req.params;
  
  // Buscar el hábito
  const habito = db.habitos.find(h => h.id === parseInt(id));
  if (!habito) {
    return res.status(404).json({ error: "Hábito no encontrado" });
  }

  // Buscar al usuario dueño del hábito (el usuario 1)
  const usuario = db.usuarios.find(u => u.id === habito.usuario_id);

  // Calcular recompensas según la dificultad
  let xpGanada = 10;
  let oroGanado = 5;

  if (habito.dificultad === "MEDIA") {
    xpGanada = 20;
    oroGanado = 15;
  } else if (habito.dificultad === "DIFICIL") {
    xpGanada = 40;
    oroGanado = 30;
  }

  // Aplicar recompensas al usuario
  usuario.xp += xpGanada;
  usuario.oro += oroGanado;
  let subioDeNivel = false;

  // Lógica de Subir de Nivel (Level Up!)
  if (usuario.xp >= usuario.xp_siguiente_nivel) {
    usuario.xp -= usuario.xp_siguiente_nivel; // Restamos la XP usada
    usuario.nivel += 1;                       // Sube nivel
    usuario.xp_siguiente_nivel = Math.round(usuario.xp_siguiente_nivel * 1.5); // Siguiente nivel es más difícil
    subioDeNivel = true;
  }

  // Actualizar datos del hábito
  habito.racha_actual += 1;
  habito.ultima_vez_cumplido = new Date();

  // Responder con el estado actual del juego
  res.json({
    mensaje: "¡Hábito completado! 💪🎮",
    recompensas: { xpGanada, oroGanado },
    estadoUsuario: {
      nombre: usuario.nombre,
      nivel: usuario.nivel,
      xpActual: usuario.xp,
      xpNecesaria: usuario.xp_siguiente_nivel,
      oroTotal: usuario.oro
    },
    subioDeNivel
  });
};