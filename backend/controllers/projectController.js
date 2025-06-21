import { factory } from './handlerFactory.js';
import Project from "../models/Project.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/apperror.js";

// Fetch the next project
const projectController = {
  // Basic CRUD operations using factory
  getAllProjects: factory.getAll(Project),
  getProjectById: factory.getOne(Project),
  createProject: catchAsync(async (req, res, next) => {
    // Add creator to the request body
    const projectData = {
      ...req.body,
      creator: req.user._id,  // Add the logged-in user's ID as creator
      status: 'open',         // Set initial status
      applications: [],       // Initialize empty applications array
    };

    const doc = await Project.create(projectData);

    // Populate creator details in the response
    const populatedDoc = await Project.findById(doc._id).populate('creator', 'userName profilePicture');

    res.status(201).json({
      status: 'success',
      data: { project: populatedDoc }
    });
  }),
  updateProject: factory.updateOne(Project),
  deleteProject: factory.deleteOne(Project),

  //  Custom project-specific controllers...
  fetchProjects: catchAsync(async (req, res, next) => {
    try {
      // Get user ID from authenticated request
      const userId = req.user._id;
      console.log('Fetching projects for user:', userId);

      // Find all open projects except user's own
      const projects = await Project.find({
        creator: { $ne: userId },
        status: 'open'
      }).populate('creator', 'userName profilePicture');

      res.status(200).json({
        status: 'success',
        results: projects.length,
        data: { projects }
      });
    } catch (error) {
      console.error('Error fetching projects:', error);
      next(error);
    }
  }),

  // Save a project
  saveProject: catchAsync(async (req, res, next) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return next(new AppError("Project not found", 404));
    }
    // Logic to save the project for the user
    res.status(200).json({
      status: "success",
      message: "Project saved"
    });
  }),

  // Apply for a project
  applyProject: catchAsync(async (req, res, next) => {
    const project = await Project.findById(req.params.id);

    if (!project) {
      return next(new AppError("Project not found", 404));
    }

    // Check if user already applied
    const existingApplication = project.applications.find(
      app => app.user.toString() === req.user._id.toString()
    );

    if (existingApplication) {
      return next(new AppError("Already applied to this project", 400));
    }

    project.applications.push({
      user: req.user._id,
      status: 'pending'
    });

    await project.save();
    res.status(200).json({
      status: "success",
      message: "Application submitted successfully"
    });
  }),

  // Skip a project
  skipProject: catchAsync(async (req, res, next) => {
    // Logic to skip the project
    res.status(200).json({
      status: "success",
      message: "Project skipped"
    });
  }),

  // Fetch projects created by the logged-in user, with pagination
  getMyProjects: catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 5;
    const skip = (page - 1) * limit;

    const total = await Project.countDocuments({ creator: userId });
    const projects = await Project.find({ creator: userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('creator', 'userName profilePicture');

    res.status(200).json({
      status: 'success',
      results: projects.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: { projects }
    });
  }),

}
export default projectController;
