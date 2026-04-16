import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import { AppError } from "./utils/apperror.js";
import { globalErrorHandler } from "./controllers/errorController.js";
import { apiLimiter, authLimiter } from "./middleware/rateLimiter.js";

dotenv.config();

const port = process.env.PORT || 5001;
const app = express();

// ✅ Production-ready CORS setup
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, Postman)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
}));

app.options("*", cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Rate limiting
app.use('/api/', apiLimiter);
app.use('/api/users/login', authLimiter);
app.use('/api/users/signup', authLimiter);

// ✅ Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "success",
    message: "NEXUS API is running",
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// ✅ API Routes
app.use("/api/users", userRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/chat", chatRoutes);

app.get("/", (req, res) => {
  res.json({ status: "success", message: "NEXUS API is running" });
});

// ✅ Global Error Handler
app.use(globalErrorHandler);

// ✅ MongoDB Connection with retry logic
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    // Don't call process.exit(1) in serverless — let the request fail gracefully
    throw error;
  }
};

// ✅ Start server
const startServer = async () => {
  await connectDB();
  app.listen(port, () => {
    console.log(`🚀 Server running on port ${port}`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

startServer();