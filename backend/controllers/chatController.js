import Message from "../models/Message.js";
import Project from "../models/Project.js";
import { AppError } from "../utils/apperror.js";
import { catchAsync } from "../utils/catchAsync.js";

// Check if the current user has access to a project's chat
// Access is granted to: project creator and accepted members
const hasProjectAccess = async (projectId, userId) => {
  const project = await Project.findById(projectId);
  if (!project) return { access: false, project: null };

  const isCreator = project.creator.toString() === userId.toString();
  const isAcceptedMember = project.applications.some(
    (app) =>
      app.user.toString() === userId.toString() && app.status === "accepted"
  );

  return { access: isCreator || isAcceptedMember, project };
};

// GET /api/chat/:projectId — fetch messages for a project
export const getMessages = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;
  const { access } = await hasProjectAccess(projectId, req.user._id);

  if (!access) {
    return next(new AppError("You do not have access to this project's chat", 403));
  }

  const messages = await Message.find({ project: projectId })
    .sort({ createdAt: 1 })
    .limit(100)
    .populate("sender", "userName profilePicture email");

  res.status(200).json({
    status: "success",
    data: { messages },
  });
});

// POST /api/chat/:projectId — send a message
export const sendMessage = catchAsync(async (req, res, next) => {
  const { projectId } = req.params;
  const { text } = req.body;

  if (!text || !text.trim()) {
    return next(new AppError("Message text is required", 400));
  }

  const { access } = await hasProjectAccess(projectId, req.user._id);
  if (!access) {
    return next(new AppError("You do not have access to this project's chat", 403));
  }

  const message = await Message.create({
    project: projectId,
    sender: req.user._id,
    text: text.trim(),
  });

  await message.populate("sender", "userName profilePicture email");

  res.status(201).json({
    status: "success",
    data: { message },
  });
});

// GET /api/chat — get all project chats accessible to the current user
export const getMyChats = catchAsync(async (req, res, next) => {
  const userId = req.user._id;

  // Projects the user created
  const createdProjects = await Project.find({ creator: userId })
    .select("title status members applications")
    .lean();

  // Projects where the user has an accepted application
  const appliedProjects = await Project.find({
    applications: {
      $elemMatch: { user: userId, status: "accepted" },
    },
  })
    .select("title status creator applications")
    .lean();

  // Merge and de-duplicate
  const projectMap = new Map();
  [...createdProjects, ...appliedProjects].forEach((p) => {
    projectMap.set(p._id.toString(), p);
  });

  const projects = Array.from(projectMap.values());

  // For each project, get the latest message and unread count
  const chats = await Promise.all(
    projects.map(async (project) => {
      const lastMessage = await Message.findOne({ project: project._id })
        .sort({ createdAt: -1 })
        .populate("sender", "userName")
        .lean();

      return {
        projectId: project._id,
        projectTitle: project.title,
        projectStatus: project.status,
        lastMessage: lastMessage
          ? {
              text: lastMessage.text,
              senderName: lastMessage.sender?.userName || "Unknown",
              createdAt: lastMessage.createdAt,
            }
          : null,
      };
    })
  );

  // Sort by last message date, projects with messages first
  chats.sort((a, b) => {
    if (!a.lastMessage && !b.lastMessage) return 0;
    if (!a.lastMessage) return 1;
    if (!b.lastMessage) return -1;
    return new Date(b.lastMessage.createdAt) - new Date(a.lastMessage.createdAt);
  });

  res.status(200).json({
    status: "success",
    data: { chats },
  });
});
