const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../config/db');
const Role = require('../models/Role');
const User = require('../models/User');
const Product = require('../models/Product');
const { Order, OrderItem } = require('../models/Order');

const TEST_EMAIL = `orderuser_${Date.now()}@vetcare.test`;
let authToken;
let testUserId;
let testProductId;

beforeAll(async () => {
  await sequelize.sync({ alter: true });
  await Role.findOrCreate({ where: { name: 'User' } });

  const registerRes = await request(app)
    .post('/api/auth/register')
    .send({ username: `OrderTestUser_${Date.now()}`, email: TEST_EMAIL, password: 'Test@1234' });
  authToken = registerRes.body.token;
  testUserId = registerRes.body._id;

  const product = await Product.create({
    name: 'Test Shampoo',
    category: 'Grooming',
    price: 200,
    stock_quantity: 5,
    image_url: 'https://via.placeholder.com/150'
  });
  testProductId = product.id;
});

afterAll(async () => {
  const user = await User.findOne({ where: { email: TEST_EMAIL } });
  if (user) {
    const orders = await Order.findAll({ where: { user_id: user.id } });
    for (const order of orders) {
      await OrderItem.destroy({ where: { order_id: order.id } });
    }
    await Order.destroy({ where: { user_id: user.id } });
    await user.destroy();
  }
  if (testProductId) await Product.destroy({ where: { id: testProductId } });
  await sequelize.close();
});

describe('📦 Orders API', () => {
  describe('POST /api/orders — Place order', () => {
    it('should place an order successfully', async () => {
      const res = await request(app)
        .post('/api/orders')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          items: [{ product_id: testProductId, quantity: 2, price: 200 }],
          total_amount: 400
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.total_amount).toBe('400.00');
    });

    it('should reject order placement without auth token', async () => {
      const res = await request(app)
        .post('/api/orders')
        .send({
          items: [{ product_id: testProductId, quantity: 1, price: 200 }],
          total_amount: 200
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/orders — Fetch orders', () => {
    it('should return the orders list for the authenticated user', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.count).toBeGreaterThan(0);
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/orders');
      expect(res.statusCode).toBe(401);
    });
  });
});
