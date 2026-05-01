import mongoose from "mongoose";

const commentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    required: [true, "Comment text is required"],
    maxlength: [500, "Comment cannot exceed 500 characters"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const postSchema = new mongoose.Schema({
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  content: {
    type: String,
    required: [true, "Post content is required"],
    maxlength: [2000, "Post cannot exceed 2000 characters"],
  },
  // Optional category to flag what the post is about
  kind: {
    type: String,
    enum: ["update", "milestone", "launch", "looking", "general"],
    default: "general",
  },
  // Optional reference to a project this post is about
  relatedProject: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
  },
  // Optional image (data URL or hosted URL)
  image: {
    type: String,
  },
  likes: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  }],
  comments: [commentSchema],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

postSchema.index({ createdAt: -1 });

const Post = mongoose.model("Post", postSchema);
export default Post;
