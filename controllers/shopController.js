const pool = require('../config/db');

exports.comprar = async (req, res, next) => {
  const { producto, costo } = req.body;

  try {
    const usuarioResult = await pool.query('SELECT * FROM usuarios WHERE id = $1', [req.usuario.id]);
    if (usuarioResult.rows.length === 0) {
      return res.status(404).json({ error: 'Usuario no encontrado.' });
    }

    const usuario = usuarioResult.rows[0];
    if (usuario.oro < costo) {
      return res.status(400).json({ error: `Oro insuficiente. Necesitas ${costo} y tienes ${usuario.oro}.` });
    }

    await pool.query('UPDATE usuarios SET oro = oro - $1 WHERE id = $2', [costo, req.usuario.id]);
    await pool.query(
      'INSERT INTO transacciones_tienda (usuario_id, producto, costo) VALUES ($1, $2, $3)',
      [req.usuario.id, producto, costo]
    );

    const updatedUser = await pool.query('SELECT * FROM usuarios WHERE id = $1', [req.usuario.id]);
    const u = updatedUser.rows[0];

    res.json({
      mensaje: `¡Recompensa "${producto}" adquirida!`,
      oroRestante: u.oro,
      estadoUsuario: {
        nombre: u.nombre,
        nivel: u.nivel,
        xpActual: u.xp,
        xpNecesaria: u.xp_siguiente_nivel,
        oroTotal: u.oro
      }
    });
  } catch (error) {
    next(error);
  }
};

exports.getHistorial = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM transacciones_tienda WHERE usuario_id = $1 ORDER BY created_at DESC',
      [req.usuario.id]
    );
    res.json(result.rows);
  } catch (error) {
    next(error);
  }
};
