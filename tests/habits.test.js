const request = require('supertest');
const app = require('../app');

let token;
let habitId;
const testEmail = `habits_${Date.now()}@correo.com`;

beforeAll(async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ nombre: 'Habits Tester', email: testEmail, password: 'Test1234!' });
  token = res.body.token;
});

describe('POST /api/habits', () => {
  it('debería crear un hábito nuevo', async () => {
    const res = await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Leer 30 min', dificultad: 'MEDIA', frecuencia: 'DIARIO' });

    expect(res.status).toBe(201);
    expect(res.body.nombre).toBe('Leer 30 min');
    expect(res.body.dificultad).toBe('MEDIA');
    expect(res.body.racha_actual).toBe(0);
    habitId = res.body.id;
  });

  it('debería rechazar hábito sin nombre', async () => {
    const res = await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: '', dificultad: 'FACIL' });

    expect(res.status).toBe(400);
  });

  it('debería rechazar dificultad inválida', async () => {
    const res = await request(app)
      .post('/api/habits')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Test', dificultad: 'IMPOSIBLE' });

    expect(res.status).toBe(400);
  });

  it('debería rechazar sin token', async () => {
    const res = await request(app)
      .post('/api/habits')
      .send({ nombre: 'No Auth', dificultad: 'FACIL' });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/habits', () => {
  it('debería devolver los hábitos del usuario', async () => {
    const res = await request(app)
      .get('/api/habits')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThan(0);
  });
});

describe('PUT /api/habits/:id', () => {
  it('debería actualizar un hábito', async () => {
    const res = await request(app)
      .put(`/api/habits/${habitId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Leer 45 min', dificultad: 'DIFICIL' });

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Leer 45 min');
    expect(res.body.dificultad).toBe('DIFICIL');
  });

  it('debería devolver 404 para hábito inexistente', async () => {
    const res = await request(app)
      .put('/api/habits/99999')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Fantasma', dificultad: 'FACIL' });

    expect(res.status).toBe(404);
  });
});

describe('POST /api/habits/:id/complete', () => {
  it('debería completar un hábito y dar XP/oro', async () => {
    const res = await request(app)
      .post(`/api/habits/${habitId}/complete`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('recompensas');
    expect(res.body.recompensas.xpGanada).toBeGreaterThan(0);
    expect(res.body.recompensas.oroGanado).toBeGreaterThan(0);
    expect(res.body.estadoUsuario.nivel).toBeGreaterThanOrEqual(1);
  });

  it('debería rechazar completar el mismo hábito dos veces al día', async () => {
    const res = await request(app)
      .post(`/api/habits/${habitId}/complete`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/hoy/);
  });
});

describe('DELETE /api/habits/:id', () => {
  it('debería eliminar un hábito', async () => {
    const res = await request(app)
      .delete(`/api/habits/${habitId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.mensaje).toMatch(/eliminado/);
  });

  it('debería devolver 404 para hábito ya eliminado', async () => {
    const res = await request(app)
      .delete(`/api/habits/${habitId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
