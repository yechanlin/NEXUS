import express from 'express';
import morgan from 'morgan';
import cors from 'cors';

import projectRouter from './routes/projectRoutes.js';
import userRouter from './routes/userRoutes.js';
import { AppError } from './utils/apperror.js';
import globalErrorHandler from './controllers/errorController.js';

const app = express();
app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);
app.use(express.json());

app.get('/', (req, res) => {
  res.send('Hello from Vercel Backend!');
});

app.use('/api/users', userRouter);
app.use('/api/projects', projectRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
