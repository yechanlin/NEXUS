import express from "express";
import postController from "../controllers/postController.js";
import authController from "../controllers/authController.js";

const router = express.Router();

router.get("/",            authController.protect, postController.getFeed);
router.post("/",           authController.protect, postController.createPost);
router.delete("/:id",      authController.protect, postController.deletePost);
router.post("/:id/like",   authController.protect, postController.toggleLike);
router.post("/:id/comment", authController.protect, postController.addComment);

export default router;
