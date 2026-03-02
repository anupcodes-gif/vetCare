
require('dotenv').config();
const { sequelize } = require('./config/db');
const Doctor = require('./models/Doctor');

const doctors = [
  {
    name: 'Rajesh Sharma',
    specialization: 'General Veterinary Medicine',
    experience: 10,
    image_url: null
  },
  {
    name: 'Sita Thapa',
    specialization: 'Pet Surgery',
    experience: 8,
    image_url: null
  },
  {
    name: 'Anil Karki',
    specialization: 'Dermatology',
    experience: 5,
    image_url: null
  },
  {
    name: 'Priya Gurung',
    specialization: 'Dental Care',
    experience: 6,
    image_url: null
  },
  {
    name: 'Bikash Adhikari',
    specialization: 'Emergency & Critical Care',
    experience: 12,
    image_url: null
  }
];

const seedDoctors = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected.');
    await sequelize.sync();

    const existing = await Doctor.count();
    if (existing > 0) {
      console.log(`Doctors already seeded (${existing} found). Skipping.`);
      process.exit(0);
    }

    await Doctor.bulkCreate(doctors);
    console.log(`✅ ${doctors.length} doctors seeded successfully!`);
    console.log('');
    doctors.forEach(d => console.log(`  - Dr. ${d.name} (${d.specialization})`));
    process.exit(0);
  } catch (error) {
    console.error('Error seeding doctors:', error.message);
    process.exit(1);
  }
};

seedDoctors();
