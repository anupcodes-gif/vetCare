const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');
const User = require('./User');

const Pet = sequelize.define('Pet', {
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
  name: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  species: {
    type: DataTypes.STRING(100),
    allowNull: false
  },
  breed: {
    type: DataTypes.STRING(100)
  },
  age: {
    type: DataTypes.INTEGER
  }
}, {
  tableName: 'pets',
  timestamps: true,
  paranoid: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at',
  deletedAt: 'deleted_at'
});

Pet.belongsTo(User, { foreignKey: 'user_id' });
User.hasMany(Pet, { foreignKey: 'user_id' });

module.exports = Pet;
