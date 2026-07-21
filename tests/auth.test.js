const request = require('supertest');
const app = require('../app');

let token;
let refreshToken;
const testEmail = `test_${Date.now()}@correo.com`;
const testPassword = 'Test1234!';

describe('POST /api/auth/register', () => {
  it('debería registrar un usuario nuevo', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'Test User', email: testEmail, password: testPassword });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.usuario).toHaveProperty('id');
    expect(res.body.usuario.nombre).toBe('Test User');
    expect(res.body.usuario.nivel).toBe(1);
    expect(res.body.usuario.oro).toBe(0);

    token = res.body.token;
    refreshToken = res.body.refreshToken;
  });

  it('debería rechazar email duplicado', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'Dup User', email: testEmail, password: testPassword });

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/ya está registrado/);
  });

  it('debería rechazar campos vacíos', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: '', email: '', password: '' });

    expect(res.status).toBe(400);
  });

  it('debería rechazar contraseña débil', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'Weak', email: 'weak@test.com', password: '123' });

    expect(res.status).toBe(400);
  });

  it('debería rechazar email con formato malo', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'Bad', email: 'no-es-email', password: testPassword });

    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  it('debería iniciar sesión con credenciales correctas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: testPassword });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('refreshToken');
    expect(res.body.usuario.email).toBe(testEmail);
  });

  it('debería rechazar contraseña incorrecta', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testEmail, password: 'WrongPassword1!' });

    expect(res.status).toBe(401);
    expect(res.body.error).toMatch(/incorrectas/);
  });

  it('debería rechazar email inexistente', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'noexiste@test.com', password: testPassword });

    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/refresh', () => {
  it('debería devolver un nuevo token', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('refreshToken');
  });

  it('debería rechazar refresh token inválido', async () => {
    const res = await request(app)
      .post('/api/auth/refresh')
      .send({ refreshToken: 'token_falso' });

    expect(res.status).toBe(401);
  });
});
