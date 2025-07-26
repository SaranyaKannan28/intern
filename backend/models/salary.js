import { DataTypes } from 'sequelize';
import sequelize from '../config/db.js';

const Salary = sequelize.define('Salary', {
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  amount: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  paidTo: {
    type: DataTypes.STRING,
    allowNull: false
  },
  paidOn: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  paidThrough: {
    type: DataTypes.STRING,
    allowNull: false
  },
  startDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  endDate: {
    type: DataTypes.DATEONLY,
    allowNull: false
  },
  remarks: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  tableName: 'salaries',
  timestamps: true
});

export default Salary;
