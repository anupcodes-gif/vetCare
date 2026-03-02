const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Pet = require('./Pet');

const MedicalRecord = sequelize.define('MedicalRecord', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  pet_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Pet,
      key: 'id'
    }
  },
  diagnosis: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  treatment: {
    type: DataTypes.TEXT
  },
  visit_date: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'medical_records',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

MedicalRecord.belongsTo(Pet, { foreignKey: 'pet_id' });
Pet.hasMany(MedicalRecord, { foreignKey: 'pet_id' });

module.exports = MedicalRecord;
