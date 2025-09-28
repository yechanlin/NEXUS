import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import User from "../models/User.js";
import { promisify } from "util";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/apperror.js";

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

// Signup Controller
const signup = catchAsync(async (req, res, next) => {
  const { email, password, passwordConfirm } = req.body;

  // Validate only essential fields
  if (!email || !password || !passwordConfirm) {
    return next(new AppError("Email, password and password confirmation are required.", 400));
  }
  if (password !== passwordConfirm) {
    return next(new AppError("Passwords do not match.", 400));
  }

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return next(new AppError("User already exists.", 400));
  }

  // Create new user with only required fields
  const hashedPassword = await bcrypt.hash(password, 12);
  const newUser = await User.create({
    email,
    password: hashedPassword
  });

  // Sign token and send response
  const token = signToken(newUser._id);
  res.status(201).json({
    status: "success",
    token,
    data: {
      user: newUser
    }
  });
});

// Login Controller
const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  console.log('Login attempt for:', email);

  // 1) Check if email and password exist
  if (!email || !password) {
    return next(new AppError('Please provide email and password!', 400));
  }
  // 2) Check if user exists && password is correct
  const user = await User.findOne({ email }).select('+password');
  console.log('User found:', user ? 'yes' : 'no');

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError('Incorrect email or password', 401));
  }

  // 3) If everything ok, send token to client
  const token = signToken(user._id);
  console.log('Login successful, token generated');

  res.status(200).json({
    status: 'success',
    token,
    data: {
      user: {
        id: user._id,
        email: user.email
      }
    }
  });
});

// Protect Middleware (Authorization)
const protect = catchAsync(async (req, res, next) => {
  console.log('Headers:', req.headers);

  let token;
  if (req.headers.authorization && req.headers.authorization.startsWith("Bearer")) {
    token = req.headers.authorization.split(" ")[1];
    console.log('Extracted token:', token);
  }

  if (!token) {
    return next(new AppError("No token found. Please log in.", 401));
  }

  try {
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    console.log('Token decoded:', decoded);

    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return next(new AppError("User not found", 401));
    }

    req.user = currentUser;
    next();
  } catch (error) {
    console.error('Token verification error:', error);
    return next(new AppError("Invalid token. Please log in again.", 401));
  }
});

// Logout Controller (optional - for JWT tokens, logout is handled client-side)
const logout = catchAsync(async (req, res, next) => {
  // For JWT tokens, logout is typically handled client-side by removing the token
  // This endpoint can be used for logging purposes or if you want to blacklist tokens
  res.status(200).json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

const authController = { signup, login, logout, protect };
export default authController;
