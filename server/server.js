const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { connectDB, sequelize } = require('./config/db');
const Role = require('./models/Role');

const app = express();


const initDB = async () => {
  await connectDB();
  
  await sequelize.sync({ alter: true });
  console.log('All models synced successfully.');

  
  const roles = ['Admin', 'User'];
  for (const roleName of roles) {
    await Role.findOrCreate({ where: { name: roleName } });
  }
  console.log('Default roles seeded.');
};

initDB();


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));


app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/pets', require('./routes/petRoutes'));
app.use('/api/doctors', require('./routes/doctorRoutes'));
app.use('/api/appointments', require('./routes/appointmentRoutes'));
app.use('/api/products', require('./routes/productRoutes'));
app.use('/api/orders', require('./routes/orderRoutes'));
app.use('/api/admin', require('./routes/adminRoutes'));
app.use('/api/health', require('./routes/petHealthRoutes'));

app.get('/', (req, res) => {
  res.send('VetCare API is running...');
});


app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : {}
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
});
