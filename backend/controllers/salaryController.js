import { createSalary, getAllSalaries, getSalaryById, updateSalary, deleteSalary } from '../services/salaryService.js';
import { sendJson, sendError } from '../utils/http.js';
import { URL } from 'url';

export const addSalary = (req, res) => {
  let body = '';
  req.on('data', chunk => (body += chunk));
  req.on('end', async () => {
    try {
      const data = JSON.parse(body);
      
      // Validate required fields
      if (!data.type || !data.amount || !data.paidTo || !data.paidOn || !data.paidThrough || !data.startDate || !data.endDate) {
        return sendError(res, 400, 'Missing required fields');
      }
      
      const newSalary = await createSalary(data);
      sendJson(res, 201, newSalary);
    } catch (err) {
      console.error('Error creating salary:', err);
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
    console.error('Error fetching salaries:', err);
    sendError(res, 500, err.message);
  }
};

export const getSalary = async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    
    const salary = await getSalaryById(id);
    if (!salary) {
      return sendError(res, 404, 'Salary record not found');
    }
    
    sendJson(res, 200, salary);
  } catch (err) {
    console.error('Error fetching salary:', err);
    sendError(res, 500, err.message);
  }
};

export const updateSalaryRecord = (req, res) => {
  let body = '';
  req.on('data', chunk => (body += chunk));
  req.on('end', async () => {
    try {
      const url = new URL(req.url, `http://${req.headers.host}`);
      const pathParts = url.pathname.split('/');
      const id = pathParts[pathParts.length - 1];
      
      const data = JSON.parse(body);
      const updatedSalary = await updateSalary(id, data);
      sendJson(res, 200, updatedSalary);
    } catch (err) {
      console.error('Error updating salary:', err);
      if (err.message === 'Salary record not found') {
        sendError(res, 404, err.message);
      } else {
        sendError(res, 500, err.message);
      }
    }
  });
};

export const deleteSalaryRecord = async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    const pathParts = url.pathname.split('/');
    const id = pathParts[pathParts.length - 1];
    
    const result = await deleteSalary(id);
    sendJson(res, 200, result);
  } catch (err) {
    console.error('Error deleting salary:', err);
    if (err.message === 'Salary record not found') {
      sendError(res, 404, err.message);
    } else {
      sendError(res, 500, err.message);
    }
  }
};