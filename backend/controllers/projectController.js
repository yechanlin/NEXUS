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

      // Get user's skipped and applied projects
      const user = await (await import('../models/User.js')).default.findById(userId);
      const skipped = user.skippedProjects || [];

      // Find all open projects except user's own, skipped, and already applied
      const projects = await Project.find({
        creator: { $ne: userId },
        status: 'open',
        _id: { $nin: skipped },
        'applications.user': { $ne: userId }
      })
        .populate('creator', 'userName profilePicture')
        .populate('applications.user', 'userName profilePicture');

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
    const userId = req.user._id;
    const projectId = req.params.id;
    const user = await (await import('../models/User.js')).default.findById(userId);
    if (!user) {
      return next(new AppError('User not found', 404));
    }
    if (!user.skippedProjects.includes(projectId)) {
      user.skippedProjects.push(projectId);
      await user.save();
    }
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
      .populate('creator', 'userName profilePicture')
      .populate('applications.user', 'userName profilePicture');

    res.status(200).json({
      status: 'success',
      results: projects.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: { projects }
    });
  }),

  // Get applications for a specific project (for recruiters)
  getApplications: catchAsync(async (req, res, next) => {
    const project = await Project.findById(req.params.id)
      .populate('applications.user', 'userName email profilePicture')
      .populate('creator', 'userName profilePicture');

    if (!project) {
      return next(new AppError("Project not found", 404));
    }

    // Check if the user is the creator of the project
    if (project.creator._id.toString() !== req.user._id.toString()) {
      return next(new AppError("Not authorized to view applications for this project", 403));
    }

    res.status(200).json({
      status: 'success',
      data: {
        project: {
          _id: project._id,
          title: project.title,
          applications: project.applications
        }
      }
    });
  }),

  // Update application status (accept/reject)
  updateApplicationStatus: catchAsync(async (req, res, next) => {
    const { projectId, applicationId } = req.params;
    const { status } = req.body;

    if (!['accepted', 'rejected'].includes(status)) {
      return next(new AppError("Invalid status. Must be 'accepted' or 'rejected'", 400));
    }

    const project = await Project.findById(projectId);

    if (!project) {
      return next(new AppError("Project not found", 404));
    }

    // Check if the user is the creator of the project
    if (project.creator.toString() !== req.user._id.toString()) {
      return next(new AppError("Not authorized to update applications for this project", 403));
    }

    // Find and update the specific application
    const application = project.applications.id(applicationId);
    if (!application) {
      return next(new AppError("Application not found", 404));
    }

    application.status = status;
    await project.save();

    // Send notification to the applicant
    const User = (await import('../models/User.js')).default;
    const applicant = await User.findById(application.user);
    if (applicant) {
      applicant.notifications.push({
        type: 'application_status',
        message: `Your application for '${project.title}' was ${status}.`,
        relatedProject: project._id,
        read: false,
        timestamp: new Date()
      });
      await applicant.save();
    }

    res.status(200).json({
      status: 'success',
      message: `Application ${status} successfully`,
      data: { application }
    });
  }),

  // Get user's applications (for applicants to see their application status)
  getUserApplications: catchAsync(async (req, res, next) => {
    const userId = req.user._id;
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

    // Find projects where user has applied
    const projects = await Project.find({
      'applications.user': userId
    })
      .populate('creator', 'userName profilePicture')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    // Extract user's applications from each project
    const User = (await import('../models/User.js')).default;
    const userApplications = await Promise.all(projects.map(async project => {
      const application = project.applications.find(app =>
        app.user.toString() === userId.toString()
      );
      let creator = project.creator;

      // If creator is not populated, fetch it explicitly
      if (!creator || !creator.userName) {
        try {
          creator = await User.findById(project.creator).select('userName profilePicture');
          // If creator doesn't exist (deleted user), provide fallback data
          if (!creator) {
            creator = {
              _id: project.creator,
              userName: 'Deleted User',
              profilePicture: null
            };
          }
        } catch (error) {
          console.error('Error fetching creator data:', error);
          // Provide fallback data if there's an error
          creator = {
            _id: project.creator,
            userName: 'Unknown User',
            profilePicture: null
          };
        }
      }

      return {
        project: {
          _id: project._id,
          title: project.title,
          description: project.description,
          category: project.category,
          projectType: project.projectType,
          creator: creator
        },
        application: {
          _id: application._id,
          status: application.status,
          appliedAt: application.appliedAt
        }
      };
    }));

    const total = await Project.countDocuments({
      'applications.user': userId
    });

    res.status(200).json({
      status: 'success',
      results: userApplications.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: { applications: userApplications }
    });
  }),

}
export default projectController;
