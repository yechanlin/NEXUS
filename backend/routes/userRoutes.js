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

// Logout a user
router.post("/logout", authController.logout);

// Get all users
router.get("/", userController.getAllUsers);

// Get notifications for the logged-in user (must be before /:id)
router.get('/notifications', authController.protect, getNotifications);

// Update the user profile
router.patch("/profilesetup", authController.protect, userController.updateUserProfile);

// Get a user
router.get("/:id", userController.getUser);

export default router;
