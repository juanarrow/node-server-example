import request from 'supertest';
import app from '../app.js';
import { prisma } from '../lib/prisma.js';

describe('Media API', () => {
  let authToken: string;
  let userId: number;

  beforeAll(async () => {
    // Limpiar base de datos
    await prisma.media.deleteMany();
    await prisma.user.deleteMany();

    // Crear usuario y obtener token
    const registerRes = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'mediauser@test.com',
        name: 'Media User',
        password: 'Test1234',
      });

    authToken = registerRes.body.token;
    userId = registerRes.body.user.id;
  });

  afterAll(async () => {
    // Limpiar
    await prisma.media.deleteMany();
    await prisma.user.deleteMany();
    await prisma.$disconnect();
  });

  describe('POST /api/media/upload', () => {
    it('debería subir una imagen exitosamente', async () => {
      // Crear un buffer de imagen de prueba (1x1 pixel PNG)
      const imageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );

      const res = await request(app)
        .post('/api/media/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', imageBuffer, 'test.png');

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty('id');
      expect(res.body).toHaveProperty('publicId');
      expect(res.body).toHaveProperty('secureUrl');
      expect(res.body.userId).toBe(userId);
    }, 15000); // Timeout de 15s para upload a Cloudinary

    it('debería fallar sin archivo', async () => {
      const res = await request(app)
        .post('/api/media/upload')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty('error');
    });

    it('debería fallar sin autenticación', async () => {
      const imageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );

      const res = await request(app)
        .post('/api/media/upload')
        .attach('file', imageBuffer, 'test.png');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/media', () => {
    it('debería listar medios del usuario', async () => {
      const res = await request(app)
        .get('/api/media')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
    });

    it('debería fallar sin autenticación', async () => {
      const res = await request(app).get('/api/media');

      expect(res.status).toBe(401);
    });
  });

  describe('GET /api/media/:id', () => {
    let mediaId: number;

    beforeAll(async () => {
      // Crear un media de prueba
      const imageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );

      const uploadRes = await request(app)
        .post('/api/media/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', imageBuffer, 'test2.png');

      mediaId = uploadRes.body.id;
    }, 15000);

    it('debería obtener un media por ID', async () => {
      const res = await request(app)
        .get(`/api/media/${mediaId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe(mediaId);
    });

    it('debería fallar con ID inválido', async () => {
      const res = await request(app)
        .get('/api/media/invalid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
    });

    it('debería fallar con media no existente', async () => {
      const res = await request(app)
        .get('/api/media/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /api/media/:id', () => {
    let mediaId: number;

    beforeEach(async () => {
      // Crear un media de prueba para cada test
      const imageBuffer = Buffer.from(
        'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        'base64'
      );

      const uploadRes = await request(app)
        .post('/api/media/upload')
        .set('Authorization', `Bearer ${authToken}`)
        .attach('file', imageBuffer, 'test-delete.png');

      mediaId = uploadRes.body.id;
    }, 15000);

    it('debería eliminar un media exitosamente', async () => {
      const res = await request(app)
        .delete(`/api/media/${mediaId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(204);

      // Verificar que se eliminó
      const getRes = await request(app)
        .get(`/api/media/${mediaId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(getRes.status).toBe(404);
    }, 15000);

    it('debería fallar con ID inválido', async () => {
      const res = await request(app)
        .delete('/api/media/invalid')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(400);
    });

    it('debería fallar sin autenticación', async () => {
      const res = await request(app).delete(`/api/media/${mediaId}`);

      expect(res.status).toBe(401);
    });
  });
});

