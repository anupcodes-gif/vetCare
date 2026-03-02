const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');
const Pet = require('./Pet');
const Doctor = require('./Doctor');

const Appointment = sequelize.define('Appointment', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    references: {
      model: User,
      key: 'id'
    }
  },
  pet_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Pet,
      key: 'id'
    }
  },
  doctor_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Doctor,
      key: 'id'
    }
  },
  appointment_date: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING(50),
    defaultValue: 'Pending'
  },
  reason: {
    type: DataTypes.TEXT
  },
  report: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'appointments',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

Appointment.belongsTo(User, { foreignKey: 'user_id' });
Appointment.belongsTo(Pet, { foreignKey: 'pet_id' });
Appointment.belongsTo(Doctor, { foreignKey: 'doctor_id' });

module.exports = Appointment;
