const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../config/db');
const Role = require('../models/Role');
const User = require('../models/User');
const Product = require('../models/Product');

const TEST_EMAIL = `produser_${Date.now()}@vetcare.test`;
let adminToken;
let createdProductId;

beforeAll(async () => {
  await sequelize.sync({ alter: true });
  const [adminRole] = await Role.findOrCreate({ where: { name: 'Admin' } });
  await Role.findOrCreate({ where: { name: 'User' } });

  const bcrypt = require('bcryptjs');
  const hashedPassword = await bcrypt.hash('Admin@1234', 10);
  const [adminUser] = await User.findOrCreate({
    where: { email: TEST_EMAIL },
    defaults: {
      username: `ProdAdminUser_${Date.now()}`,
      email: TEST_EMAIL,
      password_hash: hashedPassword,
      role_id: adminRole.id
    }
  });

  const loginRes = await request(app)
    .post('/api/auth/login')
    .send({ email: TEST_EMAIL, password: 'Admin@1234' });
  adminToken = loginRes.body.token;
});

afterAll(async () => {
  const user = await User.findOne({ where: { email: TEST_EMAIL } });
  if (user) {
    if (createdProductId) await Product.destroy({ where: { id: createdProductId } });
    await user.destroy();
  }
  await sequelize.close();
});

describe('🛍️ Products API', () => {
  describe('GET /api/products — Get all products', () => {
    it('should return the products list (public endpoint)', async () => {
      const res = await request(app).get('/api/products');

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
    });

    it('should filter products by category', async () => {
      const product = await Product.create({
        name: 'Test Dog Food',
        category: 'Food',
        price: 500,
        stock_quantity: 10,
        image_url: 'https://via.placeholder.com/150'
      });
      createdProductId = product.id;

      const res = await request(app).get('/api/products?category=Food');
      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.forEach(p => expect(p.category).toBe('Food'));
    });

    it('should return empty for a non-existent category', async () => {
      const res = await request(app).get('/api/products?category=NonExistentCategory');
      expect(res.statusCode).toBe(200);
      expect(res.body.data).toHaveLength(0);
    });
  });
});
