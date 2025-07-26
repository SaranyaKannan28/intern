import { addSalary, getSalaries } from '../controllers/salaryController.js';

export const handleSalaryRoutes = (req, res) => {
  if (req.method === 'POST' && req.url === '/api/salaries') {
    return addSalary(req, res);
  }

  if (req.method === 'GET' && req.url.startsWith('/api/salaries')) {
    return getSalaries(req, res);
  }
};
