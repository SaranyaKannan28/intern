import sequelize from '../config/db.js';
import Salary from './salary.js';

const initModels = async () => {
  await sequelize.sync(); // Use sync({ force: true }) only if needed
  console.log('DB & tables synced');
};

export { initModels, Salary };
