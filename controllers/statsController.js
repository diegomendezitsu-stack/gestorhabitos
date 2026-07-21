const pool = require('../config/db');

exports.getStats = async (req, res, next) => {
  try {
    const userId = req.usuario.id;

    const userRes = await pool.query(
      'SELECT nivel, xp, xp_siguiente_nivel, oro FROM usuarios WHERE id = $1',
      [userId]
    );
    const user = userRes.rows[0];

    const totalRes = await pool.query(
      'SELECT COUNT(*)::int as total FROM habitos WHERE usuario_id = $1 AND activo = TRUE',
      [userId]
    );

    const completadosHoyRes = await pool.query(
      `SELECT COUNT(*)::int as total FROM completaciones WHERE usuario_id = $1 AND completado_en::date = CURRENT_DATE`,
      [userId]
    );

    const totalCompletadosRes = await pool.query(
      `SELECT COUNT(*)::int as total FROM completaciones WHERE usuario_id = $1`,
      [userId]
    );

    const rachaMaxRes = await pool.query(
      'SELECT COALESCE(MAX(mejor_racha), 0)::int as max_racha FROM habitos WHERE usuario_id = $1',
      [userId]
    );

    const hace7 = new Date();
    hace7.setDate(hace7.getDate() - 7);

    const semanaRes = await pool.query(
      `SELECT completado_en::date as dia, COUNT(*)::int as cantidad
       FROM completaciones
       WHERE usuario_id = $1 AND completado_en >= $2
       GROUP BY dia ORDER BY dia`,
      [userId, hace7.toISOString()]
    );

    const stats = {
      usuario: {
        nivel: user.nivel,
        xp: user.xp,
        xp_siguiente_nivel: user.xp_siguiente_nivel,
        oro: user.oro,
      },
      habitosActivos: totalRes.rows[0].total,
      completadosHoy: completadosHoyRes.rows[0].total,
      completadosTotal: totalCompletadosRes.rows[0].total,
      rachaMaxima: rachaMaxRes.rows[0].max_racha,
      progresoSemana: semanaRes.rows,
    };

    res.json({ stats });
  } catch (error) {
    next(error);
  }
};

exports.getWeeklyHeatmap = async (req, res, next) => {
  try {
    const userId = req.usuario.id;
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      days.push(d.toISOString().split('T')[0]);
    }

    const result = await pool.query(
      `SELECT completado_en::date as dia, COUNT(*)::int as cantidad
       FROM completaciones
       WHERE usuario_id = $1
         AND completado_en::date >= $2
       GROUP BY dia`,
      [userId, days[0]]
    );

    const mapa = {};
    result.rows.forEach((r) => {
      const key = new Date(r.dia).toISOString().split('T')[0];
      mapa[key] = r.cantidad;
    });

    const heatmap = days.map((d) => ({
      fecha: d,
      cantidad: mapa[d] || 0,
    }));

    res.json(heatmap);
  } catch (error) {
    next(error);
  }
};
