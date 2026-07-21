const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.register = async (req, res, next) => {
  const { nombre, email, password } = req.body;

  try {
    const existingUser = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'El email ya está registrado.' });
    }

    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id, nombre, email, nivel, xp, xp_siguiente_nivel, oro',
      [nombre, email, hashedPassword]
    );

    const usuario = result.rows[0];
    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ id: usuario.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, refreshToken, usuario });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    const result = await pool.query(
      'SELECT id, nombre, email, password, nivel, xp, xp_siguiente_nivel, oro FROM usuarios WHERE email = $1',
      [email]
    );
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    const usuario = result.rows[0];
    const validPassword = await bcrypt.compare(password, usuario.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const refreshToken = jwt.sign({ id: usuario.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    const { password: _, ...usuarioSafe } = usuario;
    res.json({ token, refreshToken, usuario: usuarioSafe });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  const { refreshToken } = req.body;

  if (!refreshToken) {
    return res.status(400).json({ error: 'Refresh token requerido.' });
  }

  try {
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const result = await pool.query('SELECT id FROM usuarios WHERE id = $1', [decoded.id]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Usuario no encontrado.' });
    }

    const newToken = jwt.sign({ id: decoded.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
    const newRefreshToken = jwt.sign({ id: decoded.id }, process.env.JWT_REFRESH_SECRET, { expiresIn: '7d' });

    res.json({ token: newToken, refreshToken: newRefreshToken });
  } catch (error) {
    return res.status(401).json({ error: 'Refresh token inválido o expirado.' });
  }
};
