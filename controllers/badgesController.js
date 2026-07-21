const pool = require('../config/db');

const BADGES = [
  { id: 'first_habit', nombre: 'Primera Mision', desc: 'Crea tu primer habito', icono: '🌟', condicion: (u, h) => h.total >= 1, progreso: (h) => ({ actual: h.total, meta: 1 }) },
  { id: 'five_habits', nombre: 'Coleccionista', desc: 'Crea 5 habitos', icono: '📚', condicion: (u, h) => h.total >= 5, progreso: (h) => ({ actual: h.total, meta: 5 }) },
  { id: 'ten_habits', nombre: 'Planificador', desc: 'Crea 10 habitos', icono: '📋', condicion: (u, h) => h.total >= 10, progreso: (h) => ({ actual: h.total, meta: 10 }) },
  { id: 'first_complete', nombre: 'Primer Paso', desc: 'Completa tu primer habito', icono: '✅', condicion: (u, h) => h.completados >= 1, progreso: (h) => ({ actual: h.completados, meta: 1 }) },
  { id: 'completions_10', nombre: 'Dedicado', desc: 'Completa 10 habitos en total', icono: '🎯', condicion: (u, h) => h.completados >= 10, progreso: (h) => ({ actual: h.completados, meta: 10 }) },
  { id: 'completions_25', nombre: 'En Forma', desc: 'Completa 25 habitos en total', icono: '💪', condicion: (u, h) => h.completados >= 25, progreso: (h) => ({ actual: h.completados, meta: 25 }) },
  { id: 'completions_50', nombre: 'Veterano', desc: 'Completa 50 habitos en total', icono: '🏅', condicion: (u, h) => h.completados >= 50, progreso: (h) => ({ actual: h.completados, meta: 50 }) },
  { id: 'completions_100', nombre: 'Maestro Absoluto', desc: 'Completa 100 habitos en total', icono: '⭐', condicion: (u, h) => h.completados >= 100, progreso: (h) => ({ actual: h.completados, meta: 100 }) },
  { id: 'completions_250', nombre: 'Leyenda Viva', desc: 'Completa 250 habitos en total', icono: '🌀', condicion: (u, h) => h.completados >= 250, progreso: (h) => ({ actual: h.completados, meta: 250 }) },
  { id: 'streak_3', nombre: 'Constante', desc: 'Alcanza racha de 3 dias', icono: '🔥', condicion: (u, h) => h.rachaMax >= 3, progreso: (h) => ({ actual: h.rachaMax, meta: 3 }) },
  { id: 'streak_7', nombre: 'Imparable', desc: 'Alcanza racha de 7 dias', icono: '💎', condicion: (u, h) => h.rachaMax >= 7, progreso: (h) => ({ actual: h.rachaMax, meta: 7 }) },
  { id: 'streak_14', nombre: 'Disciplinado', desc: 'Alcanza racha de 14 dias', icono: '🛡️', condicion: (u, h) => h.rachaMax >= 14, progreso: (h) => ({ actual: h.rachaMax, meta: 14 }) },
  { id: 'streak_30', nombre: 'Leyenda', desc: 'Alcanza racha de 30 dias', icono: '👑', condicion: (u, h) => h.rachaMax >= 30, progreso: (h) => ({ actual: h.rachaMax, meta: 30 }) },
  { id: 'streak_60', nombre: 'Inmortal', desc: 'Alcanza racha de 60 dias', icono: '🏆', condicion: (u, h) => h.rachaMax >= 60, progreso: (h) => ({ actual: h.rachaMax, meta: 60 }) },
  { id: 'level_5', nombre: 'Aventurero', desc: 'Alcanza nivel 5', icono: '⚔️', condicion: (u) => u.nivel >= 5, progreso: (u, h, user) => ({ actual: user.nivel, meta: 5 }) },
  { id: 'level_10', nombre: 'Heroe', desc: 'Alcanza nivel 10', icono: '🗡️', condicion: (u) => u.nivel >= 10, progreso: (u, h, user) => ({ actual: user.nivel, meta: 10 }) },
  { id: 'level_15', nombre: 'Campeon', desc: 'Alcanza nivel 15', icono: '🏅', condicion: (u) => u.nivel >= 15, progreso: (u, h, user) => ({ actual: user.nivel, meta: 15 }) },
  { id: 'level_25', nombre: 'Maestro', desc: 'Alcanza nivel 25', icono: '🎖️', condicion: (u) => u.nivel >= 25, progreso: (u, h, user) => ({ actual: user.nivel, meta: 25 }) },
  { id: 'level_50', nombre: 'Dios', desc: 'Alcanza nivel 50', icono: '🔱', condicion: (u) => u.nivel >= 50, progreso: (u, h, user) => ({ actual: user.nivel, meta: 50 }) },
  { id: 'oro_100', nombre: 'Ahorrista', desc: 'Acumula 100 de oro', icono: '💰', condicion: (u) => u.oro >= 100, progreso: (u, h, user) => ({ actual: user.oro, meta: 100 }) },
  { id: 'oro_500', nombre: 'Rico', desc: 'Acumula 500 de oro', icono: '🤑', condicion: (u) => u.oro >= 500, progreso: (u, h, user) => ({ actual: user.oro, meta: 500 }) },
  { id: 'oro_1000', nombre: 'Magnate', desc: 'Acumula 1000 de oro', icono: '🏦', condicion: (u) => u.oro >= 1000, progreso: (u, h, user) => ({ actual: user.oro, meta: 1000 }) },
  { id: 'perfect_day', nombre: 'Dia Perfecto', desc: 'Completa todos tus habitos en un dia', icono: '🌈', condicion: (u, h) => h.perfectDay, progreso: () => null },
];

async function checkAndUnlockBadges(userId) {
  const userRes = await pool.query(
    'SELECT nivel, xp, xp_siguiente_nivel, oro FROM usuarios WHERE id = $1',
    [userId]
  );
  const user = userRes.rows[0];

  const totalRes = await pool.query(
    'SELECT COUNT(*)::int as total FROM habitos WHERE usuario_id = $1 AND activo = TRUE',
    [userId]
  );

  const completadosRes = await pool.query(
    'SELECT COUNT(*)::int as total FROM completaciones WHERE usuario_id = $1',
    [userId]
  );

  const rachaMaxRes = await pool.query(
    'SELECT COALESCE(MAX(mejor_racha), 0)::int as max_racha FROM habitos WHERE usuario_id = $1',
    [userId]
  );

  const activos = totalRes.rows[0].total;

  let perfectDay = false;
  if (activos > 0) {
    const completadosHoyRes = await pool.query(
      'SELECT COUNT(*)::int as total FROM completaciones WHERE usuario_id = $1 AND completado_en::date = CURRENT_DATE',
      [userId]
    );
    const completadosHoy = completadosHoyRes.rows[0].total;
    perfectDay = completadosHoy > 0 && completadosHoy >= activos;
  }

  const stats = {
    usuario: { nivel: user.nivel, xp: user.xp, xp_siguiente_nivel: user.xp_siguiente_nivel, oro: user.oro },
    habitos: {
      total: activos,
      completados: completadosRes.rows[0].total,
      rachaMax: rachaMaxRes.rows[0].max_racha,
      perfectDay,
    },
  };

  const nuevosDesbloqueados = [];

  for (const badge of BADGES) {
    if (badge.condicion(stats.usuario, stats.habitos)) {
      const result = await pool.query(
        'INSERT INTO logros (usuario_id, logro_id) VALUES ($1, $2) ON CONFLICT (usuario_id, logro_id) DO NOTHING RETURNING id',
        [userId, badge.id]
      );
      if (result.rows.length > 0) {
        nuevosDesbloqueados.push({ id: badge.id, nombre: badge.nombre, desc: badge.desc, icono: badge.icono });
      }
    }
  }

  return nuevosDesbloqueados;
}

exports.getBadges = async (req, res, next) => {
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

    const completadosRes = await pool.query(
      'SELECT COUNT(*)::int as total FROM completaciones WHERE usuario_id = $1',
      [userId]
    );

    const rachaMaxRes = await pool.query(
      'SELECT COALESCE(MAX(mejor_racha), 0)::int as max_racha FROM habitos WHERE usuario_id = $1',
      [userId]
    );

    const activos = totalRes.rows[0].total;

    let perfectDay = false;
    if (activos > 0) {
      const completadosHoyRes = await pool.query(
        'SELECT COUNT(*)::int as total FROM completaciones WHERE usuario_id = $1 AND completado_en::date = CURRENT_DATE',
        [userId]
      );
      perfectDay = completadosHoyRes.rows[0].total >= activos;
    }

    const statsCalculadas = {
      total: activos,
      completados: completadosRes.rows[0].total,
      rachaMax: rachaMaxRes.rows[0].max_racha,
      perfectDay,
    };

    const unlocks = await pool.query(
      'SELECT logro_id, desbloqueado_en FROM logros WHERE usuario_id = $1',
      [userId]
    );
    const unlockedMap = {};
    unlocks.rows.forEach(u => { unlockedMap[u.logro_id] = u.desbloqueado_en; });

    const badges = BADGES.map(b => {
      const p = b.progreso(statsCalculadas, statsCalculadas, user);
      return {
        id: b.id,
        nombre: b.nombre,
        desc: b.desc,
        icono: b.icono,
        desbloqueado: !!unlockedMap[b.id],
        desbloqueado_en: unlockedMap[b.id] || null,
        actualmente_cumple: b.condicion(user, statsCalculadas),
        progreso: p,
      };
    });

    res.json({
      badges,
      totalBadges: BADGES.length,
      desbloqueados: unlocks.rows.length,
    });
  } catch (error) {
    next(error);
  }
};

exports.getBadgesDefinitions = () => BADGES;

module.exports = exports;
module.exports.checkAndUnlockBadges = checkAndUnlockBadges;
