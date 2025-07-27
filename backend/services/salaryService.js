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

  return await Salary.findAll({ 
    where: whereClause,
    order: [['paidOn', 'DESC']] // Order by payment date, newest first
  });
};

export const getSalaryById = async (id) => {
  return await Salary.findByPk(id);
};

export const updateSalary = async (id, salaryData) => {
  const [updatedRowsCount] = await Salary.update(salaryData, {
    where: { id }
  });
  
  if (updatedRowsCount === 0) {
    throw new Error('Salary record not found');
  }
  
  return await Salary.findByPk(id);
};

export const deleteSalary = async (id) => {
  const deletedRowsCount = await Salary.destroy({
    where: { id }
  });
  
  if (deletedRowsCount === 0) {
    throw new Error('Salary record not found');
  }
  
  return { message: 'Salary record deleted successfully' };
};