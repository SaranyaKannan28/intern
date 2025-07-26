import { handleSalaryRoutes } from './routes/salaryRoutes.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export const requestHandler = (req, res) => {
  if (req.url.startsWith('/api/salaries')) {
    return handleSalaryRoutes(req, res);
  }

  // Serve static HTML (frontend)
  if (req.method === 'GET' && (req.url === '/' || req.url === '/index.html')) {
    const filePath = path.join(__dirname, 'public', 'index.html');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading HTML');
      } else {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(data);
      }
    });
  }
};
