const request = require('supertest');
const app = require('../app');

let token;
const testEmail = `shop_${Date.now()}@correo.com`;

beforeAll(async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ nombre: 'Shop Tester', email: testEmail, password: 'Test1234!' });
  token = res.body.token;
});

describe('POST /api/shop/comprar', () => {
  it('debería rechazar compra sin oro suficiente', async () => {
    const res = await request(app)
      .post('/api/shop/comprar')
      .set('Authorization', `Bearer ${token}`)
      .send({ producto: 'Netflix', costo: 30 });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/insuficiente/);
  });

  it('debería rechazar compra sin campos', async () => {
    const res = await request(app)
      .post('/api/shop/comprar')
      .set('Authorization', `Bearer ${token}`)
      .send({ producto: '', costo: '' });

    expect(res.status).toBe(400);
  });

  it('debería rechazar costo negativo', async () => {
    const res = await request(app)
      .post('/api/shop/comprar')
      .set('Authorization', `Bearer ${token}`)
      .send({ producto: 'Cheat', costo: -10 });

    expect(res.status).toBe(400);
  });

  it('debería rechazar sin token', async () => {
    const res = await request(app)
      .post('/api/shop/comprar')
      .send({ producto: 'Netflix', costo: 30 });

    expect(res.status).toBe(401);
  });
});

describe('GET /api/shop/historial', () => {
  it('debería devolver historial vacío', async () => {
    const res = await request(app)
      .get('/api/shop/historial')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('GET /api/health', () => {
  it('debería devolver status ok', async () => {
    const res = await request(app).get('/api/health');

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body).toHaveProperty('timestamp');
  });
});

describe('Rutas inexistentes', () => {
  it('debería devolver 404 para ruta no existente', async () => {
    const res = await request(app).get('/api/noexiste');

    expect(res.status).toBe(404);
    expect(res.body.error).toMatch(/no encontrada/);
  });
});
