import { Salary } from '../models/index.js';
import { Op } from 'sequelize';

export const createSalary = async (salaryData) => {
  return await Salary.create(salaryData);
};

export const getAllSalaries = async (filters = {}) => {
  const whereClause = {};

  // Optional filtering logic
  if (filters.startDate && filters.endDate) {
    whereClause.paidOn = {
      [Op.between]: [filters.startDate, filters.endDate]
    };
  }

  return await Salary.findAll({ where: whereClause });
};
