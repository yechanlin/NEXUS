import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: [true, "Email is required"],
    unique: true,
    validate: [validator.isEmail, "Please provide a valid email"]
  },
  password: {
    type: String,
    required: [true, "Password is required"]
  },
  profilePicture: {
    type: String,
    default: "https://via.placeholder.com/120"
  },
  userName: String,
  dateOfBirth: Date,
  school: String,
  fieldOfStudy: String,
  bio: {
    type: String,
    maxlength: [500, "Bio cannot exceed 500 characters"]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  skippedProjects: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    default: []
  }],
  notifications: [{
    type: {
      type: String, // e.g., 'application_status', 'new_application'
      required: true
    },
    message: {
      type: String,
      required: true
    },
    relatedProject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Project',
    },
    read: {
      type: Boolean,
      default: false
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }]
});

// Virtual populate for applied projects
userSchema.virtual("appliedProjects", {
  ref: "Project", // Reference the Project model
  localField: "_id", // The local field in the User schema
  foreignField: "applicants", // The field in the Project schema referencing User
});

userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

const User = mongoose.model("User", userSchema);
export default User;
