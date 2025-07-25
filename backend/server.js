const http = require('http');
const mysql = require('mysql');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

// MySQL Connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'msec@123', // Update if you set a password
  database: 'salary_app'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL!');
});

const server = http.createServer((req, res) => {
  if (req.method === 'GET') {
    if (req.url === '/') {
      const filePath = path.join(__dirname, 'index.html');
      fs.readFile(filePath, (err, content) => {
        res.writeHead(200, { 'Content-Type': 'text/html' });
        res.end(content);
      });
    } else if (req.url === '/style.css') {
      const filePath = path.join(__dirname, 'style.css');
      fs.readFile(filePath, (err, content) => {
        res.writeHead(200, { 'Content-Type': 'text/css' });
        res.end(content);
      });
    } else if (req.url === '/script.js') {
      const filePath = path.join(__dirname, 'script.js');
      fs.readFile(filePath, (err, content) => {
        res.writeHead(200, { 'Content-Type': 'application/javascript' });
        res.end(content);
      });
    } else if (req.url === '/get-salaries') {
      db.query('SELECT * FROM salaries', (err, result) => {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(result));
      });
    } else {
      res.writeHead(404);
      res.end('Not Found');
    }
  } else if (req.method === 'POST' && req.url === '/add-salary') {
    let body = '';
    req.on('data', chunk => (body += chunk.toString()));
    req.on('end', () => {
      const formData = querystring.parse(body);
      const { name, position, salary } = formData;
      db.query(
        'INSERT INTO salaries (name, position, salary) VALUES (?, ?, ?)',
        [name, position, salary],
        (err) => {
          if (err) {
            res.writeHead(500);
            res.end('Database insert error');
          } else {
            res.writeHead(302, { Location: '/' });
            res.end();
          }
        }
      );
    });
  }
});

server.listen(3000, () => {
  console.log('Server running at http://localhost:3000');
});
