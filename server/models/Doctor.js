const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Doctor = sequelize.define('Doctor', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  specialization: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  experience: {
    type: DataTypes.INTEGER
  },
  image_url: {
    type: DataTypes.TEXT
  }
}, {
  tableName: 'doctors',
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at'
});

module.exports = Doctor;
