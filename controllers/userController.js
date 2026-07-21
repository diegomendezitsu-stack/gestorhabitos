const pool = require('../config/db');

const AVATARS = [
  '🧙‍♂️','🧙‍♀️','🦸‍♂️','🦸‍♀️','🧑‍🚀','🦹‍♂️','🦹‍♀️','🧑‍💻','👨‍🎨','👩‍🎨',
  '🦊','🐱','🐶','🦁','🐯','🐼','🐨','🦄','🐙','🦋',
  '🐲','🐉','🦅','🦉','🐺','🦝','🦌','🐢','🐬','🦈',
  '🤖','👾','👽','🎭','🥷','🧑‍🏭','🧑‍🔬','🧑‍🍳','🧑‍🎓','🧑‍🎤',
  '💀','👻','🎃','🔥','⚡','❄️','🌟','💎','🎲','🎯'
];

exports.getProfile = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, nombre, email, nivel, xp, xp_siguiente_nivel, oro, avatar, created_at FROM usuarios WHERE id = $1',
      [req.usuario.id]
    );
    if (result.rows.length === 0) return res.status(404).json({ error: 'Usuario no encontrado.' });
    res.json(result.rows[0]);
  } catch (error) { next(error); }
};

exports.updateProfile = async (req, res, next) => {
  const { nombre, avatar } = req.body;
  try {
    const result = await pool.query(
      `UPDATE usuarios
       SET nombre = COALESCE($1, nombre),
           avatar = COALESCE($2, avatar)
       WHERE id = $3
       RETURNING id, nombre, email, nivel, xp, xp_siguiente_nivel, oro, avatar`,
      [nombre?.trim() || null, avatar || null, req.usuario.id]
    );

    res.json(result.rows[0]);
  } catch (error) { next(error); }
};

exports.getAvatars = (req, res) => {
  res.json({ avatars: AVATARS });
};

exports.exportData = async (req, res, next) => {
  try {
    const userId = req.usuario.id;

    const user = await pool.query(
      'SELECT id, nombre, email, nivel, xp, xp_siguiente_nivel, oro, created_at FROM usuarios WHERE id = $1',
      [userId]
    );

    const habits = await pool.query(
      'SELECT id, nombre, dificultad, frecuencia, racha_actual, activo, created_at FROM habitos WHERE usuario_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    const transactions = await pool.query(
      'SELECT id, producto, costo, created_at FROM transacciones_tienda WHERE usuario_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    const levelHistory = await pool.query(
      'SELECT nivel_anterior, nivel_nuevo, created_at FROM nivel_historial WHERE usuario_id = $1 ORDER BY created_at DESC',
      [userId]
    );

    const exportData = {
      exportedAt: new Date().toISOString(),
      app: 'HabitLife',
      usuario: user.rows[0],
      habitos: habits.rows,
      transacciones: transactions.rows,
      historialNiveles: levelHistory.rows,
      totalHabitos: habits.rows.length,
      habitosActivos: habits.rows.filter((h) => h.activo).length,
      totalTransacciones: transactions.rows.length,
      oroGastado: transactions.rows.reduce((sum, t) => sum + t.costo, 0),
    };

    res.setHeader('Content-Disposition', 'attachment; filename=habitlife-export.json');
    res.setHeader('Content-Type', 'application/json');
    res.json(exportData);
  } catch (error) { next(error); }
};

exports.deleteAccount = async (req, res, next) => {
  const { confirmacion } = req.body;
  if (confirmacion !== 'ELIMINAR') {
    return res.status(400).json({ error: 'Escribe ELIMINAR para confirmar.' });
  }

  try {
    await pool.query('DELETE FROM usuarios WHERE id = $1', [req.usuario.id]);
    res.json({ mensaje: 'Cuenta eliminada correctamente.' });
  } catch (error) { next(error); }
};
