const pool = require('../config/db');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

exports.register = async (req, res) => {
  const { nombre, email, password } = req.body;

  if (!nombre || !email || !password) {
    return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
  }

  try {
    const existingUser = await pool.query('SELECT id FROM usuarios WHERE email = $1', [email]);
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'El email ya está registrado.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const result = await pool.query(
      'INSERT INTO usuarios (nombre, email, password) VALUES ($1, $2, $3) RETURNING id, nombre, email, nivel, xp, xp_siguiente_nivel, oro',
      [nombre, email, hashedPassword]
    );

    const usuario = result.rows[0];
    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.status(201).json({ token, usuario });
  } catch (error) {
    console.error('Error en registro:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
  }

  try {
    const result = await pool.query('SELECT * FROM usuarios WHERE email = $1', [email]);
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    const usuario = result.rows[0];
    const validPassword = await bcrypt.compare(password, usuario.password);

    if (!validPassword) {
      return res.status(401).json({ error: 'Credenciales incorrectas.' });
    }

    const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        email: usuario.email,
        nivel: usuario.nivel,
        xp: usuario.xp,
        xp_siguiente_nivel: usuario.xp_siguiente_nivel,
        oro: usuario.oro
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    res.status(500).json({ error: 'Error interno del servidor.' });
  }
};
