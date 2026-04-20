import { factory } from './handlerFactory.js';
import User from "../models/User.js";
import Project from "../models/Project.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/apperror.js";

const userController = {
  // Basic CRUD operations using factory
  getAllUsers: factory.getAll(User),
  getUser: factory.getOne(User),
  updateUser: factory.updateOne(User),
  deleteUser: factory.deleteOne(User),

  // Returns only public-safe fields + the user's created projects
  // (factory.getOne returns the full doc including password hash — not safe to expose publicly)
  getPublicProfile: catchAsync(async (req, res, next) => {
    const user = await User.findById(req.params.id)
      .select('userName profilePicture bio school fieldOfStudy createdAt');
    if (!user) return next(new AppError('No user found with that ID', 404));

    const projects = await Project.find({ creator: req.params.id })
      .select('title description category projectType skillsRequired createdAt')
      .sort('-createdAt')
      .limit(10);

    res.status(200).json({ status: 'success', data: { user, projects } });
  }),

  updateUserProfile: catchAsync(async (req, res, next) => {
    const { profilePicture, userName, dateOfBirth, school, fieldOfStudy, bio } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,
      { profilePicture, userName, dateOfBirth, school, fieldOfStudy, bio },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return next(new AppError("No user found with that ID", 404));
    }

    res.status(200).json({ status: "success", data: updatedUser });
  }),
};

export const getNotifications = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const User = (await import('../models/User.js')).default;
  const user = await User.findById(userId).populate('notifications.relatedProject', 'title');
  if (!user) {
    return next(new AppError('User not found', 404));
  }
  res.status(200).json({
    status: 'success',
    results: user.notifications.length,
    data: { notifications: user.notifications }
  });
});

export const markNotificationsRead = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  await User.updateOne(
    { _id: userId },
    { $set: { 'notifications.$[].read': true } }
  );
  res.status(200).json({ status: 'success' });
});

export default userController;