const pool = require('../config/db');

const BADGES = [
  { id: 'first_habit', nombre: 'Primera Mision', desc: 'Crea tu primer habito', icono: '🌟', condicion: (u, h) => h.total >= 1 },
  { id: 'five_habits', nombre: 'Coleccionista', desc: 'Crea 5 habitos', icono: '📚', condicion: (u, h) => h.total >= 5 },
  { id: 'first_complete', nombre: 'Primer Paso', desc: 'Completa tu primer habito', icono: '✅', condicion: (u, h) => h.completados >= 1 },
  { id: 'streak_3', nombre: 'Constante', desc: 'Alcanza racha de 3 dias', icono: '🔥', condicion: (u, h) => h.rachaMax >= 3 },
  { id: 'streak_7', nombre: 'Imparable', desc: 'Alcanza racha de 7 dias', icono: '💎', condicion: (u, h) => h.rachaMax >= 7 },
  { id: 'streak_30', nombre: 'Leyenda', desc: 'Alcanza racha de 30 dias', icono: '👑', condicion: (u, h) => h.rachaMax >= 30 },
  { id: 'level_5', nombre: 'Aventurero', desc: 'Alcanza nivel 5', icono: '⚔️', condicion: (u) => u.nivel >= 5 },
  { id: 'level_10', nombre: 'Heroe', desc: 'Alcanza nivel 10', icono: '🏆', condicion: (u) => u.nivel >= 10 },
  { id: 'level_25', nombre: 'Maestro', desc: 'Alcanza nivel 25', icono: '🎖️', condicion: (u) => u.nivel >= 25 },
  { id: 'oro_100', nombre: 'Ahorrista', desc: 'Acumula 100 de oro', icono: '💰', condicion: (u) => u.oro >= 100 },
  { id: 'oro_500', nombre: 'Rico', desc: 'Acumula 500 de oro', icono: '🤑', condicion: (u) => u.oro >= 500 },
  { id: 'completions_10', nombre: 'Dedicado', desc: 'Completa 10 habitos en total', icono: '🎯', condicion: (u, h) => h.completados >= 10 },
  { id: 'completions_50', nombre: 'Veterano', desc: 'Completa 50 habitos en total', icono: '🏅', condicion: (u, h) => h.completados >= 50 },
  { id: 'completions_100', nombre: 'Maestro Absoluto', desc: 'Completa 100 habitos en total', icono: '🌟', condicion: (u, h) => h.completados >= 100 },
];

exports.getStats = async (req, res, next) => {
  try {
    const userId = req.usuario.id;

    const userRes = await pool.query('SELECT * FROM usuarios WHERE id = $1', [userId]);
    const user = userRes.rows[0];

    const totalRes = await pool.query(
      'SELECT COUNT(*)::int as total FROM habitos WHERE usuario_id = $1 AND activo = TRUE',
      [userId]
    );

    const completadosRes = await pool.query(
      `SELECT COUNT(*)::int as total FROM nivel_historial WHERE usuario_id = $1`,
      [userId]
    );

    const rachaMaxRes = await pool.query(
      'SELECT COALESCE(MAX(racha_actual), 0)::int as max_racha FROM habitos WHERE usuario_id = $1',
      [userId]
    );

    const hoy = new Date();
    const hace7 = new Date(hoy);
    hace7.setDate(hace7.getDate() - 7);

    const semanaRes = await pool.query(
      `SELECT ultima_vez_cumplido::date as dia, COUNT(*)::int as cantidad
       FROM nivel_historial nh
       JOIN habitos h ON h.usuario_id = nh.usuario_id
       WHERE nh.usuario_id = $1 AND nh.created_at >= $2
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
      completadosHoy: completadosRes.rows[0].total,
      rachaMaxima: rachaMaxRes.rows[0].max_racha,
      progresoSemana: semanaRes.rows,
    };

    const statsCalculadas = {
      total: stats.habitosActivos,
      completados: stats.completadosHoy,
      rachaMax: stats.rachaMaxima,
    };

    const badgesDesbloqueados = BADGES.filter((b) => b.condicion(stats.usuario, statsCalculadas));

    res.json({
      stats,
      badges: badgesDesbloqueados.map((b) => ({ id: b.id, nombre: b.nombre, desc: b.desc, icono: b.icono })),
      totalBadges: BADGES.length,
    });
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
      `SELECT ultima_vez_cumplido::date as dia, COUNT(*)::int as cantidad
       FROM habitos
       WHERE usuario_id = $1
         AND ultima_vez_cumplido IS NOT NULL
         AND ultima_vez_cumplido::date >= $2
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
