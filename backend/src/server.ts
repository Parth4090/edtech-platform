import { app } from './app';
import { env } from './config/env';

const server = app.listen(env.PORT, () => {
  console.log(`===========================================`);
  console.log(` Ed-Tech Platform Backend Server Running `);
  console.log(` Port: ${env.PORT}`);
  console.log(` Mode: ${env.NODE_ENV}`);
  console.log(` API Base: http://localhost:${env.PORT}/api`);
  console.log(` Health Check: http://localhost:${env.PORT}/api/health`);
  console.log(`===========================================`);
});

// Graceful shutdown
const shutdown = () => {
  console.log('Shutting down server gracefully...');
  server.close(() => {
    console.log('Server process terminated.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);
