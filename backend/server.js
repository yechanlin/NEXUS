import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import cors from "cors";
import userRoutes from "./routes/userRoutes.js";
import projectRoutes from "./routes/projectRoutes.js";
import { AppError } from "./utils/apperror.js";
import { globalErrorHandler } from "./controllers/errorController.js";

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
  origin: process.env.NODE_ENV === 'production'
    ? allowedOrigins
    : "*",
  methods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
  allowedHeaders: "Content-Type,Authorization",
  credentials: true,
}));

app.options("*", cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ✅ Production logging
if (process.env.NODE_ENV !== 'production') {
  app.use((req, res, next) => {
    console.log('Incoming request:', {
      method: req.method,
      path: req.path,
      body: req.body,
      headers: req.headers
    });
    next();
  });
}

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

app.get("/", (req, res) => {
  res.json({ status: "success", message: "NEXUS API is running" });
});

// ✅ Global Error Handler
app.use(globalErrorHandler);

// ✅ MongoDB Connection with retry logic
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error);
    process.exit(1);
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