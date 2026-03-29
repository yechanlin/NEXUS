import express from "express";
import { getMessages, sendMessage, getMyChats } from "../controllers/chatController.js";
import authController from "../controllers/authController.js";
const { protect } = authController;

const router = express.Router();

// All chat routes require authentication
router.use(protect);

router.get("/", getMyChats);
router.get("/:projectId", getMessages);
router.post("/:projectId", sendMessage);

export default router;
