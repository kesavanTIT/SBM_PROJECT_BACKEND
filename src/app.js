import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import apiRouter from './routes/index.js';
import { errorHandler, AppError } from './middlewares/error.middleware.js';

const app = express();

app.use(helmet());

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

const corsOrigin = process.env.CORS_ORIGIN || '*';
app.use(
  cors({
    origin: corsOrigin === '*' ? true : corsOrigin,
    credentials: true,
  })
);

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'Backend API is running smoothly',
    timestamp: new Date().toISOString(),
  });
});

app.use('/api/v1', apiRouter);

app.use((req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(errorHandler);

export default app; // Restart nodemon 2

// Trigger nodemon restart

// Trigger nodemon restart 3

// Trigger restart