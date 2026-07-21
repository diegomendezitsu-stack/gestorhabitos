const request = require('supertest');
const app = require('../app');

let token;
const testEmail = `stats_${Date.now()}@correo.com`;
const testPassword = 'Test1234!';

beforeAll(async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ nombre: 'Stats Tester', email: testEmail, password: testPassword });
  token = res.body.token;
});

describe('GET /api/stats', () => {
  it('debería devolver las estadísticas del usuario', async () => {
    const res = await request(app)
      .get('/api/stats')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('stats');
    expect(res.body).toHaveProperty('badges');
    expect(res.body).toHaveProperty('totalBadges');
    expect(res.body.stats.usuario).toHaveProperty('nivel');
    expect(res.body.stats.usuario).toHaveProperty('xp');
    expect(res.body.stats.usuario).toHaveProperty('oro');
    expect(res.body.stats).toHaveProperty('habitosActivos');
    expect(res.body.stats).toHaveProperty('rachaMaxima');
    expect(Array.isArray(res.body.badges)).toBe(true);
  });

  it('debería rechazar sin token', async () => {
    const res = await request(app).get('/api/stats');

    expect(res.status).toBe(401);
  });
});

describe('GET /api/stats/heatmap', () => {
  it('debería devolver el heatmap de 7 días', async () => {
    const res = await request(app)
      .get('/api/stats/heatmap')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBe(7);
    res.body.forEach((day) => {
      expect(day).toHaveProperty('fecha');
      expect(day).toHaveProperty('cantidad');
      expect(typeof day.cantidad).toBe('number');
    });
  });

  it('debería rechazar sin token', async () => {
    const res = await request(app).get('/api/stats/heatmap');

    expect(res.status).toBe(401);
  });
});
