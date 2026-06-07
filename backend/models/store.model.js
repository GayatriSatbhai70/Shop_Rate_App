const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Store = sequelize.define('Store', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  },
  name: {
    type: DataTypes.STRING(60),
    allowNull: false,
    validate: {
      len: {
        args: [20, 60],
        msg: 'Store name must be between 20 and 60 characters.',
      },
    },
  },
  email: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: {
      msg: 'Store email already in use.',
    },
    validate: {
      isEmail: {
        msg: 'Must follow standard email validation rules.',
      },
    },
  },
  address: {
    type: DataTypes.STRING(400),
    allowNull: false,
    validate: {
      len: {
        args: [0, 400],
        msg: 'Store address cannot exceed 400 characters.',
      },
    },
  },
  ownerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: {
      msg: 'A store owner can only own one store.',
    },
  },
  imageUrl: {
    type: DataTypes.STRING(1000),
    allowNull: true,
  },
}, {
  tableName: 'stores',
  timestamps: true,
});

module.exports = Store;
