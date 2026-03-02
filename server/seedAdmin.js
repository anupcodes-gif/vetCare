
require('dotenv').config();
const { sequelize } = require('./config/db');
const User = require('./models/User');
const Role = require('./models/Role');

const seedAdmin = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');

    
    await sequelize.sync();

    
    const [adminRole] = await Role.findOrCreate({ where: { name: 'Admin' } });
    await Role.findOrCreate({ where: { name: 'User' } });

    
    const existingAdmin = await User.findOne({ where: { email: 'admin@vetcare.com' } });
    if (existingAdmin) {
      console.log('Admin account already exists!');
      console.log('  Email:    admin@vetcare.com');
      console.log('  Password: admin123');
      process.exit(0);
    }

    
    await User.create({
      username: 'admin',
      email: 'admin@vetcare.com',
      password_hash: 'admin123',   
      role_id: adminRole.id
    });

    console.log('✅ Admin account created successfully!');
    console.log('');
    console.log('  Email:    admin@vetcare.com');
    console.log('  Password: admin123');
    console.log('');
    console.log('You can now login with these credentials.');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding admin:', error.message);
    process.exit(1);
  }
};

seedAdmin();
