import dotenv from 'dotenv';
dotenv.config();

import app from './app.js';
import prisma from './config/db.js';

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  try {
    console.log('Connecting to PostgreSQL database...');
    await prisma.$connect();
    console.log('PostgreSQL database connection established successfully.');

    const server = app.listen(PORT, () => {
      console.log(
        `Server is running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
      );
    });

    const shutdown = async () => {
      console.log('Shutting down server gracefully...');
      server.close(async () => {
        console.log('HTTP server closed.');
        await prisma.$disconnect();
        console.log('Database connection closed.');
        process.exit(0);
      });
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
