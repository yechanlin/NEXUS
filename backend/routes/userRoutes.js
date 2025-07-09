import express from "express";
import User from "../models/User.js";
import authController from "../controllers/authController.js";
import userController from "../controllers/userController.js";
import { AppError } from "../utils/apperror.js";
import { globalErrorHandler } from "../controllers/errorController.js";
import { getNotifications } from '../controllers/userController.js';

const router = express.Router();

// Signup a new user
router.post("/signup", authController.signup);

// Login a user
router.post("/login", authController.login);

// Get all users
router.get("/", userController.getAllUsers);

// Get a user
router.get("/:id", userController.getUser);

// Update the user profile
router.patch("/profilesetup", userController.updateUserProfile);

// Get notifications for the logged-in user
router.get('/notifications', authController.protect, getNotifications);

export default router;
