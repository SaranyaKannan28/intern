import http from 'http';
import dotenv from 'dotenv';
import { requestHandler } from './app.js';
import { initModels } from './models/index.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

const startServer = async () => {
  await initModels();

  const server = http.createServer(requestHandler);

  server.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
};

startServer();
