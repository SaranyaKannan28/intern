import { createSalary, getAllSalaries } from '../services/salaryService.js';
import { sendJson, sendError } from '../utils/http.js';
import { URL } from 'url';

export const addSalary = (req, res) => {
  let body = '';
  req.on('data', chunk => (body += chunk));
  req.on('end', async () => {
    try {
      const data = JSON.parse(body);
      const newSalary = await createSalary(data);
      sendJson(res, 201, newSalary);
    } catch (err) {
      sendError(res, 500, err.message);
    }
  });
};

export const getSalaries = async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const start = url.searchParams.get('startDate');
    const end = url.searchParams.get('endDate');

    const salaries = await getAllSalaries({ startDate: start, endDate: end });
    sendJson(res, 200, salaries);
  } catch (err) {
    sendError(res, 500, err.message);
  }
};
