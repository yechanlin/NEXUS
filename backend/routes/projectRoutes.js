import express from "express";
import projectController from "../controllers/projectController.js";
import authController from "../controllers/authController.js";


const router = express.Router();

// Specific routes first
router.get("/fetch", authController.protect, projectController.fetchProjects);
router.get("/discover", authController.protect, projectController.fetchProjects);
router.get("/my-projects", authController.protect, projectController.getMyProjects);
router.get("/my-applications", authController.protect, projectController.getUserApplications);

// Then parameterized routes
router.get("/", authController.protect, projectController.getAllProjects);
router.get("/:id", authController.protect, projectController.getProjectById);
router.get("/:id/applications", authController.protect, projectController.getApplications);
router.post("/", authController.protect, projectController.createProject);
router.patch("/:id", authController.protect, projectController.updateProject);
router.delete("/:id", authController.protect, projectController.deleteProject);
router.post("/:id/save", authController.protect, projectController.saveProject);
router.post("/:id/apply", authController.protect, projectController.applyProject);
router.post("/:id/skip", authController.protect, projectController.skipProject);
router.patch("/:projectId/applications/:applicationId", authController.protect, projectController.updateApplicationStatus);


export default router;
