const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const Pet = require('./Pet');

const Vaccination = sequelize.define('Vaccination', {
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
  vaccine_name: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  date_administered: {
    type: DataTypes.DATE,
    allowNull: false
  },
  next_due_date: {
    type: DataTypes.DATE
  }
}, {
  tableName: 'vaccinations',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

Vaccination.belongsTo(Pet, { foreignKey: 'pet_id' });
Pet.hasMany(Vaccination, { foreignKey: 'pet_id' });

module.exports = Vaccination;
