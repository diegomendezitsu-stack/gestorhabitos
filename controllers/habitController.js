const pool = require('../config/db');
const { checkAndUnlockBadges } = require('../controllers/badgesController');

const CATEGORIAS = ['general', 'salud', 'estudio', 'trabajo', 'fitness', 'meditacion', 'lectura', 'creatividad', 'social', 'finanzas'];

exports.getCategorias = (req, res) => {
  res.json({ categorias: CATEGORIAS });
};

exports.getHabits = async (req, res, next) => {
  try {
    const { categoria, archivados } = req.query;
    let query = 'SELECT id, nombre, categoria, dificultad, frecuencia, racha_actual, mejor_racha, ultima_vez_cumplido, activo, created_at FROM habitos WHERE usuario_id = $1';
    const params = [req.usuario.id];

    if (archivados === 'true') {
      query += ' AND activo = FALSE';
    } else {
      query += ' AND activo = TRUE';
    }

    if (categoria && CATEGORIAS.includes(categoria)) {
      query += ' AND categoria = $' + (params.length + 1);
      params.push(categoria);
    }

    query += ' ORDER BY created_at DESC';

    const result = await pool.query(query, params);
    res.json(result.rows);
  } catch (error) { next(error); }
};

exports.createHabit = async (req, res, next) => {
  const { nombre, dificultad, frecuencia, categoria } = req.body;

  try {
    const cat = (categoria && CATEGORIAS.includes(categoria)) ? categoria : 'general';
    const result = await pool.query(
      `INSERT INTO habitos (usuario_id, nombre, dificultad, frecuencia, categoria)
       VALUES ($1, $2, $3, $4, $5) RETURNING *`,
      [req.usuario.id, nombre, dificultad.toUpperCase(), frecuencia || 'DIARIO', cat]
    );
    const nuevosLogros = await checkAndUnlockBadges(req.usuario.id);
    res.status(201).json({ ...result.rows[0], nuevosLogros });
  } catch (error) { next(error); }
};

exports.updateHabit = async (req, res, next) => {
  const { id } = req.params;
  const { nombre, dificultad, frecuencia, categoria } = req.body;

  try {
    const existing = await pool.query(
      'SELECT id FROM habitos WHERE id = $1 AND usuario_id = $2',
      [id, req.usuario.id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Habito no encontrado.' });
    }

    const cat = (categoria && CATEGORIAS.includes(categoria)) ? categoria : null;

    const result = await pool.query(
      `UPDATE habitos
       SET nombre = COALESCE($1, nombre),
           dificultad = COALESCE($2, dificultad),
           frecuencia = COALESCE($3, frecuencia),
           categoria = COALESCE($4, categoria)
       WHERE id = $5 AND usuario_id = $6
       RETURNING *`,
      [
        nombre || null,
        dificultad ? dificultad.toUpperCase() : null,
        frecuencia ? frecuencia.toUpperCase() : null,
        cat,
        id,
        req.usuario.id
      ]
    );
    res.json(result.rows[0]);
  } catch (error) { next(error); }
};

exports.deleteHabit = async (req, res, next) => {
  const { id } = req.params;
  try {
    const existing = await pool.query(
      'SELECT id FROM habitos WHERE id = $1 AND usuario_id = $2 AND activo = TRUE',
      [id, req.usuario.id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Habito no encontrado.' });
    }
    await pool.query(
      'UPDATE habitos SET activo = FALSE WHERE id = $1 AND usuario_id = $2',
      [id, req.usuario.id]
    );
    res.json({ mensaje: 'Habito eliminado correctamente.' });
  } catch (error) { next(error); }
};

exports.restoreHabit = async (req, res, next) => {
  const { id } = req.params;
  try {
    const existing = await pool.query(
      'SELECT id FROM habitos WHERE id = $1 AND usuario_id = $2 AND activo = FALSE',
      [id, req.usuario.id]
    );
    if (existing.rows.length === 0) {
      return res.status(404).json({ error: 'Habito archivado no encontrado.' });
    }
    await pool.query(
      'UPDATE habitos SET activo = TRUE WHERE id = $1 AND usuario_id = $2',
      [id, req.usuario.id]
    );
    res.json({ mensaje: 'Habito restaurado.' });
  } catch (error) { next(error); }
};

exports.completeHabit = async (req, res, next) => {
  const { id } = req.params;
  try {
    const habitoResult = await pool.query(
      'SELECT id, nombre, dificultad, frecuencia, racha_actual, mejor_racha, ultima_vez_cumplido FROM habitos WHERE id = $1 AND usuario_id = $2 AND activo = TRUE',
      [id, req.usuario.id]
    );
    if (habitoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Habito no encontrado.' });
    }

    const habito = habitoResult.rows[0];

    const yaCompletadoHoy = await pool.query(
      'SELECT 1 FROM completaciones WHERE habito_id = $1 AND usuario_id = $2 AND completado_en::date = CURRENT_DATE',
      [id, req.usuario.id]
    );
    if (yaCompletadoHoy.rows.length > 0) {
      return res.status(400).json({ error: 'Ya completaste este habito hoy. Vuelve manana.' });
    }

    const usuarioResult = await pool.query(
      'SELECT nivel, xp, xp_siguiente_nivel, oro FROM usuarios WHERE id = $1',
      [req.usuario.id]
    );
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
      'UPDATE usuarios SET nivel = $1, xp = $2, xp_siguiente_nivel = $3, oro = oro + $4 WHERE id = $5',
      [nuevoNivel, nuevoXp, nuevoXpSiguiente, oroGanado, req.usuario.id]
    );

    const nuevaRacha = habito.racha_actual + 1;
    const mejorRacha = Math.max(nuevaRacha, habito.mejor_racha || 0);
    await pool.query(
      'UPDATE habitos SET racha_actual = $1, mejor_racha = $2, ultima_vez_cumplido = NOW() WHERE id = $3',
      [nuevaRacha, mejorRacha, habito.id]
    );

    await pool.query(
      'INSERT INTO completaciones (habito_id, usuario_id) VALUES ($1, $2)',
      [habito.id, req.usuario.id]
    );

    const updatedUser = await pool.query(
      'SELECT nombre, nivel, xp, xp_siguiente_nivel, oro FROM usuarios WHERE id = $1',
      [req.usuario.id]
    );
    const u = updatedUser.rows[0];

    const nuevosLogros = await checkAndUnlockBadges(req.usuario.id);

    res.json({
      mensaje: 'Habito completado!',
      recompensas: { xpGanada, oroGanado },
      estadoUsuario: {
        nombre: u.nombre,
        nivel: u.nivel,
        xpActual: u.xp,
        xpNecesaria: u.xp_siguiente_nivel,
        oroTotal: u.oro
      },
      subioDeNivel,
      nuevosLogros
    });
  } catch (error) { next(error); }
};

exports.undoComplete = async (req, res, next) => {
  const { id } = req.params;
  try {
    const habitoResult = await pool.query(
      'SELECT id, dificultad, racha_actual, mejor_racha, ultima_vez_cumplido FROM habitos WHERE id = $1 AND usuario_id = $2 AND activo = TRUE',
      [id, req.usuario.id]
    );
    if (habitoResult.rows.length === 0) {
      return res.status(404).json({ error: 'Habito no encontrado.' });
    }

    const habito = habitoResult.rows[0];

    const completacionHoy = await pool.query(
      'SELECT id FROM completaciones WHERE habito_id = $1 AND usuario_id = $2 AND completado_en::date = CURRENT_DATE',
      [habito.id, req.usuario.id]
    );
    if (completacionHoy.rows.length === 0) {
      return res.status(400).json({ error: 'Este habito no tiene completaciones recientes.' });
    }

    let xpRestar = 10;
    let oroRestar = 5;
    if (habito.dificultad === 'MEDIA') { xpRestar = 20; oroRestar = 15; }
    else if (habito.dificultad === 'DIFICIL') { xpRestar = 40; oroRestar = 30; }

    await pool.query(
      'UPDATE usuarios SET xp = GREATEST(0, xp - $1), oro = GREATEST(0, oro - $2) WHERE id = $3',
      [xpRestar, oroRestar, req.usuario.id]
    );

    await pool.query(
      'DELETE FROM completaciones WHERE habito_id = $1 AND usuario_id = $2 AND completado_en::date = CURRENT_DATE',
      [habito.id, req.usuario.id]
    );

    await pool.query(
      'UPDATE habitos SET racha_actual = GREATEST(0, racha_actual - 1), ultima_vez_cumplido = NULL WHERE id = $1',
      [habito.id]
    );

    const updatedUser = await pool.query(
      'SELECT nombre, nivel, xp, xp_siguiente_nivel, oro FROM usuarios WHERE id = $1',
      [req.usuario.id]
    );
    const u = updatedUser.rows[0];

    res.json({
      mensaje: 'Completacion deshecha.',
      revertido: { xpRestar, oroRestar },
      estadoUsuario: {
        nombre: u.nombre, nivel: u.nivel, xpActual: u.xp,
        xpNecesaria: u.xp_siguiente_nivel, oroTotal: u.oro
      }
    });
  } catch (error) { next(error); }
};
