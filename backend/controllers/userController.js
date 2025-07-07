import { factory } from './handlerFactory.js';
import User from "../models/User.js";
import { catchAsync } from "../utils/catchAsync.js";

const userController = {
  // Basic CRUD operations using factory
  getAllUsers: factory.getAll(User),
  getUser: factory.getOne(User),
  updateUser: factory.updateOne(User),
  deleteUser: factory.deleteOne(User),

  // Your custom user-specific controllers...
  updateUserProfile: catchAsync(async (req, res, next) => {
    const {
      userId,
      profileImage,
      userName,
      dateOfBirth,
      school,
      fieldOfStudy,
      bio,
    } = req.body;

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        profilePicture: profileImage,
        userName,
        dateOfBirth,
        school,
        fieldOfStudy,
        bio,
      },
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

export default userController;
