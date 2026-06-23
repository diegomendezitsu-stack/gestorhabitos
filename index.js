const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors());          // Permite que el Frontend se conecte desde otro origen
app.use(express.json());  // Permite que el servidor entienda datos en formato JSON

// Ruta de prueba
app.get('/', (req, res) => {
  res.json({ mensaje: "¡Bienvenido a la API del Gestor de Hábitos Gamificado! 🎮" });
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo exitosamente en el puerto ${PORT}`);
});