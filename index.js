const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();

// 1. Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 2. Rutas
const authRoutes = require('./routes/authRoutes');
const habitRoutes = require('./routes/habitRoutes');
const shopRoutes = require('./routes/shopRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/habits', habitRoutes);
app.use('/api/shop', shopRoutes);

// 3. Encender Servidor
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en el puerto ${PORT}`);
});
