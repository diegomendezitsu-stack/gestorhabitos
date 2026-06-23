const express = require('express');
const { Pool } = require('pg'); // Importamos Pool de la librería 'pg'

const app = express();
const PORT = 5000;

// 1. Configurar la conexión a la base de datos
const pool = new Pool({
    user: 'itsu',
    host: 'localhost',
    database: 'gestion',
    password: 'sitio.2024',
    port: 5432, // Puerto por defecto
});

// Probar la conexión al iniciar el servidor
pool.connect((err, client, release) => {
    if (err) {
        return console.error('Error adquiriendo el cliente de la BD', err.stack);
    }
    console.log('¡Conexión exitosa a PostgreSQL/pgAdmin!');
    release();
});

// 2. Ruta de ejemplo que consulta la base de datos
app.get('/usuarios', async (req, res) => {
    try {
        // Hacemos una consulta SQL de ejemplo (asegúrate de tener esta tabla)
        const resultado = await pool.query('SELECT * FROM usuarios');
        
        // Devolvemos las filas obtenidas en formato JSON
        res.json(resultado.rows);
    } catch (error) {
        console.error(error);
        res.status(500).send('Error en el servidor al consultar la base de datos');
    }
});

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});