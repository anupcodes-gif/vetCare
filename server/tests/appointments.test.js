const request = require('supertest');
const app = require('../app');
const { sequelize } = require('../config/db');
const Role = require('../models/Role');
const User = require('../models/User');
const Pet = require('../models/Pet');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');

const TEST_EMAIL = `apptuser_${Date.now()}@vetcare.test`;
let authToken;
let testPetId;
let testDoctorId;

beforeAll(async () => {
  await sequelize.sync({ alter: true });
  await Role.findOrCreate({ where: { name: 'User' } });

  const registerRes = await request(app)
    .post('/api/auth/register')
    .send({ username: `ApptTestUser_${Date.now()}`, email: TEST_EMAIL, password: 'Test@1234' });
  authToken = registerRes.body.token;
  const userId = registerRes.body._id;

  const pet = await Pet.create({ user_id: userId, name: 'Max', species: 'Dog', breed: 'Beagle', age: 2 });
  testPetId = pet.id;

  let doctor = await Doctor.findOne();
  if (!doctor) {
    doctor = await Doctor.create({ name: 'Dr. Test', specialization: 'General', contact: '9876543210' });
  }
  testDoctorId = doctor.id;
});

afterAll(async () => {
  const user = await User.findOne({ where: { email: TEST_EMAIL } });
  if (user) {
    await Appointment.destroy({ where: { user_id: user.id } });
    await Pet.destroy({ where: { user_id: user.id } });
    await user.destroy();
  }
  await sequelize.close();
});

describe('📅 Appointments API', () => {
  describe('POST /api/appointments — Book appointment', () => {
    it('should book an appointment successfully', async () => {
      const res = await request(app)
        .post('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          pet_id: testPetId,
          doctor_id: testDoctorId,
          appointment_date: new Date(Date.now() + 86400000).toISOString(),
          reason: 'Routine checkup'
        });

      expect(res.statusCode).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reason).toBe('Routine checkup');
    });

    it('should reject booking without authentication', async () => {
      const res = await request(app)
        .post('/api/appointments')
        .send({
          pet_id: testPetId,
          doctor_id: testDoctorId,
          appointment_date: new Date().toISOString(),
          reason: 'No auth test'
        });

      expect(res.statusCode).toBe(401);
    });
  });

  describe('GET /api/appointments — Fetch appointments', () => {
    it('should return appointments for the authenticated user', async () => {
      const res = await request(app)
        .get('/api/appointments')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.statusCode).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.count).toBeGreaterThan(0);
    });

    it('should return 401 without token', async () => {
      const res = await request(app).get('/api/appointments');
      expect(res.statusCode).toBe(401);
    });
  });
});
