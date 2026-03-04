const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../config/db');
const Role = require('../models/Role');

const TEST_EMAIL = `testuser_${Date.now()}@vetcare.test`;
const TEST_PASSWORD = 'Test@1234';
const TEST_USERNAME = `TestUser_${Date.now()}`;

beforeAll(async () => {
  await sequelize.sync({ alter: true });
  await Role.findOrCreate({ where: { name: 'User' } });
  await Role.findOrCreate({ where: { name: 'Admin' } });
});

afterAll(async () => {
  await sequelize.close();
});

describe('🔐 Auth API', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: TEST_USERNAME, email: TEST_EMAIL, password: TEST_PASSWORD });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
      expect(res.body.email).toBe(TEST_EMAIL);
      expect(res.body.role).toBe('User');
    });

    it('should reject duplicate email registration', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ username: TEST_USERNAME, email: TEST_EMAIL, password: TEST_PASSWORD });

      expect(res.statusCode).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/already exists/i);
    });

    it('should reject registration with missing fields', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'incomplete@vetcare.test' });

      expect(res.statusCode).toBeGreaterThanOrEqual(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login with correct credentials', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: TEST_EMAIL, password: TEST_PASSWORD });

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.token).toBeDefined();
    });

    it('should reject login with wrong password', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: TEST_EMAIL, password: 'WrongPassword!' });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/invalid email or password/i);
    });

    it('should reject login with non-existent email', async () => {
      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'ghost@vetcare.test', password: 'anything' });

      expect(res.statusCode).toBe(401);
      expect(res.body.success).toBe(false);
    });
  });
});
