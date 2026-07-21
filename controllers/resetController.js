const pool = require('../config/db');
const bcrypt = require('bcrypt');
const crypto = require('crypto');

exports.requestReset = async (req, res, next) => {
  const { email } = req.body;

  try {
    const result = await pool.query('SELECT id, email FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.json({ mensaje: 'Si el email esta registrado, recibirás un enlace de recuperacion.' });
    }

    const usuario = result.rows[0];
    const resetToken = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 60 * 60 * 1000);

    await pool.query(
      'UPDATE usuarios SET reset_token = $1, reset_token_expires = $2 WHERE id = $3',
      [resetToken, expires, usuario.id]
    );

    console.log(`[RESET] Token para ${email}: ${resetToken} (expira: ${expires.toISOString()})`);

    res.json({ mensaje: 'Si el email esta registrado, recibirás un enlace de recuperacion.', resetToken });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  const { token, newPassword } = req.body;

  try {
    const result = await pool.query(
      'SELECT id FROM usuarios WHERE reset_token = $1 AND reset_token_expires > NOW()',
      [token]
    );

    if (result.rows.length === 0) {
      return res.status(400).json({ error: 'Token invalido o expirado.' });
    }

    const usuario = result.rows[0];
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    await pool.query(
      'UPDATE usuarios SET password = $1, reset_token = NULL, reset_token_expires = NULL WHERE id = $2',
      [hashedPassword, usuario.id]
    );

    res.json({ mensaje: 'Contrasena actualizada correctamente.' });
  } catch (error) {
    next(error);
  }
};
