const pool = require('../config/db');

exports.getHabits = async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM habitos WHERE usuario_id = $1 AND activo = TRUE ORDER BY created_at DESC',
      [req.usuario.id]
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Error al obtener hábitos:', error);
    res.status(500).json({ error: 'Error al obtener hábitos.' });
  }
};

exports.createHabit = async (req, res) => {
  const { nombre, dificultad, frecuencia } = req.body;

  if (!nombre || !dificultad) {
    return res.status(400).json({ error: 'Faltan campos obligatorios (nombre, dificultad).' });
  }

  try {
    const result = await pool.query(
      `INSERT INTO habitos (usuario_id, nombre, dificultad, frecuencia)
       VALUES ($1, $2, $3, $4) RETURNING *`,
      [req.usuario.id, nombre, dificultad.toUpperCase(), frecuencia || 'DIARIO']
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Error al crear hábito:', error);
    res.status(500).json({ error: 'Error al crear el hábito.' });
  }
};

exports.updateHabit = async (req, res) => {
  const { id } = req.params;
  const { nombre, dificultad, frecuencia } = req.body;

  try {
    const existing = await pool.query(
      'SELECT * FROM habitos WHERE id = $1 AND usuario_id = $2',
      [id, req.usuario.id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Hábito no encontrado.' });
    }

    const result = await pool.query(
      `UPDATE habitos
       SET nombre = COALESCE($1, nombre),
           dificultad = COALESCE($2, dificultad),
           frecuencia = COALESCE($3, frecuencia)
       WHERE id = $4 AND usuario_id = $5
       RETURNING *`,
      [
        nombre || null,
        dificultad ? dificultad.toUpperCase() : null,
        frecuencia ? frecuencia.toUpperCase() : null,
        id,
        req.usuario.id
      ]
    );
    res.json(result.rows[0]);
  } catch (error) {
    console.error('Error al actualizar hábito:', error);
    res.status(500).json({ error: 'Error al actualizar el hábito.' });
  }
};

exports.deleteHabit = async (req, res) => {
  const { id } = req.params;

  try {
    const existing = await pool.query(
      'SELECT * FROM habitos WHERE id = $1 AND usuario_id = $2',
      [id, req.usuario.id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Hábito no encontrado.' });
    }

    await pool.query(
      'UPDATE habitos SET activo = FALSE WHERE id = $1 AND usuario_id = $2',
      [id, req.usuario.id]
    );
    res.json({ mensaje: 'Hábito eliminado correctamente.' });
  } catch (error) {
    console.error('Error al eliminar hábito:', error);
    res.status(500).json({ error: 'Error al eliminar el hábito.' });
  }
};

exports.completeHabit = async (req, res) => {
  const { id } = req.params;

  try {
    const habitoResult = await pool.query(
      'SELECT * FROM habitos WHERE id = $1 AND usuario_id = $2 AND activo = TRUE',
      [id, req.usuario.id]
    );
    if (habitoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Hábito no encontrado.' });
    }

    const habito = habitoResult.rows[0];
    const usuarioResult = await pool.query('SELECT * FROM usuarios WHERE id = $1', [req.usuario.id]);
    const usuario = usuarioResult.rows[0];

    let xpGanada = 10;
    let oroGanado = 5;
    if (habito.dificultad === 'MEDIA') { xpGanada = 20; oroGanado = 15; }
    else if (habito.dificultad === 'DIFICIL') { xpGanada = 40; oroGanado = 30; }

    let nuevoXp = usuario.xp + xpGanada;
    let nuevoNivel = usuario.nivel;
    let nuevoXpSiguiente = usuario.xp_siguiente_nivel;
    let subioDeNivel = false;

    if (nuevoXp >= usuario.xp_siguiente_nivel) {
      nuevoXp -= usuario.xp_siguiente_nivel;
      nuevoNivel += 1;
      nuevoXpSiguiente = Math.round(usuario.xp_siguiente_nivel * 1.5);
      subioDeNivel = true;

      await pool.query(
        'INSERT INTO nivel_historial (usuario_id, nivel_anterior, nivel_nuevo) VALUES ($1, $2, $3)',
        [req.usuario.id, usuario.nivel, nuevoNivel]
      );
    }

    await pool.query(
      `UPDATE usuarios SET nivel = $1, xp = $2, xp_siguiente_nivel = $3, oro = oro + $4 WHERE id = $5`,
      [nuevoNivel, nuevoXp, nuevoXpSiguiente, oroGanado, req.usuario.id]
    );

    await pool.query(
      'UPDATE habitos SET racha_actual = racha_actual + 1, ultima_vez_cumplido = NOW() WHERE id = $1',
      [habito.id]
    );

    const updatedUser = await pool.query('SELECT * FROM usuarios WHERE id = $1', [req.usuario.id]);
    const u = updatedUser.rows[0];

    res.json({
      mensaje: '¡Hábito completado! 💪🎮',
      recompensas: { xpGanada, oroGanado },
      estadoUsuario: {
        nombre: u.nombre,
        nivel: u.nivel,
        xpActual: u.xp,
        xpNecesaria: u.xp_siguiente_nivel,
        oroTotal: u.oro
      },
      subioDeNivel
    });
  } catch (error) {
    console.error('Error al completar hábito:', error);
    res.status(500).json({ error: 'Error al completar el hábito.' });
  }
};
