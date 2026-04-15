import express from "express";
import authController from "../controllers/authController.js";
import userController from "../controllers/userController.js";
import { getNotifications, markNotificationsRead } from '../controllers/userController.js';

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
router.patch('/notifications/read-all', authController.protect, markNotificationsRead);

// Update the user profile (requires authentication)
router.patch("/profilesetup", authController.protect, userController.updateUserProfile);

// Get a user
router.get("/:id", userController.getUser);

export default router;
