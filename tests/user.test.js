const request = require('supertest');
const app = require('../app');

let token;
const testEmail = `user_${Date.now()}@correo.com`;
const testPassword = 'Test1234!';

beforeAll(async () => {
  const res = await request(app)
    .post('/api/auth/register')
    .send({ nombre: 'User Tester', email: testEmail, password: testPassword });
  token = res.body.token;
});

describe('GET /api/user/profile', () => {
  it('debería devolver el perfil del usuario', async () => {
    const res = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('id');
    expect(res.body.nombre).toBe('User Tester');
    expect(res.body.email).toBe(testEmail);
    expect(res.body.nivel).toBe(1);
    expect(res.body).toHaveProperty('oro');
    expect(res.body).toHaveProperty('avatar');
    expect(res.body).not.toHaveProperty('password');
  });

  it('debería rechazar sin token', async () => {
    const res = await request(app).get('/api/user/profile');

    expect(res.status).toBe(401);
  });
});

describe('PUT /api/user/profile', () => {
  it('debería actualizar el nombre', async () => {
    const res = await request(app)
      .put('/api/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'Nombre Nuevo' });

    expect(res.status).toBe(200);
    expect(res.body.nombre).toBe('Nombre Nuevo');
  });

  it('debería actualizar el avatar', async () => {
    const res = await request(app)
      .put('/api/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ avatar: '🦊' });

    expect(res.status).toBe(200);
    expect(res.body.avatar).toBe('🦊');
  });

  it('debería rechazar avatar inválido', async () => {
    const res = await request(app)
      .put('/api/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ avatar: 'XYZ_INVALID' });

    expect(res.status).toBe(400);
  });

  it('debería rechazar nombre muy corto', async () => {
    const res = await request(app)
      .put('/api/user/profile')
      .set('Authorization', `Bearer ${token}`)
      .send({ nombre: 'A' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/user/avatars', () => {
  it('debería devolver la lista de avatares', async () => {
    const res = await request(app)
      .get('/api/user/avatars')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.avatars)).toBe(true);
    expect(res.body.avatars.length).toBeGreaterThan(0);
  });
});

describe('GET /api/user/export', () => {
  it('debería exportar los datos del usuario', async () => {
    const res = await request(app)
      .get('/api/user/export')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('exportedAt');
    expect(res.body.app).toBe('HabitLife');
    expect(res.body).toHaveProperty('usuario');
    expect(res.body).toHaveProperty('habitos');
    expect(res.body).toHaveProperty('transacciones');
    expect(res.body).toHaveProperty('totalHabitos');
    expect(res.headers['content-disposition']).toMatch(/attachment/);
  });
});

describe('DELETE /api/user/account', () => {
  it('debería rechazar sin confirmación', async () => {
    const res = await request(app)
      .delete('/api/user/account')
      .set('Authorization', `Bearer ${token}`)
      .send({});

    expect(res.status).toBe(400);
  });

  it('debería rechazar confirmación incorrecta', async () => {
    const res = await request(app)
      .delete('/api/user/account')
      .set('Authorization', `Bearer ${token}`)
      .send({ confirmacion: 'borrar' });

    expect(res.status).toBe(400);
  });

  it('debería eliminar la cuenta con confirmación correcta', async () => {
    const res = await request(app)
      .delete('/api/user/account')
      .set('Authorization', `Bearer ${token}`)
      .send({ confirmacion: 'ELIMINAR' });

    expect(res.status).toBe(200);
    expect(res.body.mensaje).toMatch(/eliminada/);
  });

  it('debería rechazar token de usuario eliminado', async () => {
    const res = await request(app)
      .get('/api/user/profile')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
