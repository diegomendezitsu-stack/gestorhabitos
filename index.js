const express = require('express');
const cors = require('cors');

const app = express();

// 1. Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// 2. Rutas
const habitRoutes = require('./routes/habitRoutes');
app.use('/api/habits', habitRoutes);

// 3. Encender Servidor
app.listen(5000, () => {
  console.log("✅ Servidor corriendo en el puerto 5000");
});