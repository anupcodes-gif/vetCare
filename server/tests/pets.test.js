const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../config/db');
const Role = require('../models/Role');
const User = require('../models/User');
const Pet = require('../models/Pet');

const TEST_EMAIL = `petsuser_${Date.now()}@vetcare.test`;
let authToken;
let createdPetId;

beforeAll(async () => {
  await sequelize.sync({ alter: true });
  const [userRole] = await Role.findOrCreate({ where: { name: 'User' } });

  const registerRes = await request(app)
    .post('/api/auth/register')
    .send({ username: `PetsTestUser_${Date.now()}`, email: TEST_EMAIL, password: 'Test@1234' });

  authToken = registerRes.body.token;
});

afterAll(async () => {
  const user = await User.findOne({ where: { email: TEST_EMAIL } });
  if (user) {
    await Pet.destroy({ where: { user_id: user.id } });
    await user.destroy();
  }
  await sequelize.close();
});

describe('🐾 Pets API', () => {
  describe('POST /api/pets — Register a pet', () => {
    it('should add a pet for an authenticated user', async () => {
      const res = await request(app)
        .post('/api/pets')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Buddy', species: 'Dog', breed: 'Labrador', age: 3 });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Buddy');
      createdPetId = res.body.data.id;
    });

    it('should reject pet creation without auth token', async () => {
      const res = await request(app)
        .post('/api/pets')
        .send({ name: 'Shadow', species: 'Cat', breed: 'Persian', age: 2 });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/pets — List pets', () => {
    it('should return the list of pets for the authenticated user', async () => {
      const res = await request(app)
        .get('/api/pets')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('should return 401 for unauthenticated requests', async () => {
      const res = await request(app).get('/api/pets');
      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/pets/:id — Get single pet', () => {
    it('should return the correct pet by ID', async () => {
      const res = await request(app)
        .get(`/api/pets/${createdPetId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.data.id).toBe(createdPetId);
      expect(res.body.data.name).toBe('Buddy');
    });

    it('should return 404 for a non-existent pet', async () => {
      const res = await request(app)
        .get('/api/pets/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(404);
    });
  });

  describe('PUT /api/pets/:id — Update pet', () => {
    it('should update pet details', async () => {
      const res = await request(app)
        .put(`/api/pets/${createdPetId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'BuddyUpdated', age: 4 });

      expect(res.statusCode).toBe(200);
      expect(res.body.data.name).toBe('BuddyUpdated');
    });
  });

  describe('DELETE /api/pets/:id — Delete pet', () => {
    it('should delete the pet successfully', async () => {
      const res = await request(app)
        .delete(`/api/pets/${createdPetId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toMatch(/removed/i);
    });

    it('should return 404 when deleting non-existent pet', async () => {
      const res = await request(app)
        .delete('/api/pets/999999')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(404);
    });
  });
});
