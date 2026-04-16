import express from 'express';
import cors from 'cors';

import projectRouter from './routes/projectRoutes.js';
import userRouter from './routes/userRoutes.js';
import { AppError } from './utils/apperror.js';
import globalErrorHandler from './controllers/errorController.js';
import { apiLimiter, authLimiter } from './middleware/rateLimiter.js';

const app = express();

// ✅ CORS — no wildcard, env-based whitelist
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g. mobile apps, curl, Postman)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
  })
);

app.options('*', cors());
app.use(express.json());

// ✅ Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/users/login', authLimiter);
app.use('/api/users/signup', authLimiter);

app.get('/', (req, res) => {
  res.json({ status: 'success', message: 'NEXUS API is running' });
});

app.use('/api/users', userRouter);
app.use('/api/projects', projectRouter);

app.all('*', (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

export default app;
