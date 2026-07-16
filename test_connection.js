const pool = require('./config/db');

async function test() {
  try {
    const res = await pool.query('SELECT NOW()');
    console.log('CONEXION EXITOSA a Supabase:', res.rows[0].now);
    
    const users = await pool.query('SELECT id, nombre, email, nivel, oro FROM usuarios');
    console.log('Usuarios en la BD:', JSON.stringify(users.rows, null, 2));
    
    const habits = await pool.query('SELECT * FROM habitos');
    console.log('Habitos en la BD:', JSON.stringify(habits.rows, null, 2));
    
    process.exit(0);
  } catch (err) {
    console.error('ERROR de conexion:', err.message);
    process.exit(1);
  }
}

test();
