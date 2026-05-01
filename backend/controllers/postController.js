import Post from "../models/Post.js";
import { catchAsync } from "../utils/catchAsync.js";
import { AppError } from "../utils/apperror.js";

const postController = {
  // Paginated feed — newest first
  getFeed: catchAsync(async (req, res, next) => {
    const page  = parseInt(req.query.page, 10)  || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip  = (page - 1) * limit;

    const total = await Post.countDocuments();
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate("author",         "userName profilePicture school fieldOfStudy")
      .populate("relatedProject", "title category projectType")
      .populate("comments.user",  "userName profilePicture");

    res.status(200).json({
      status: "success",
      results: posts.length,
      total,
      page,
      totalPages: Math.ceil(total / limit),
      data: { posts },
    });
  }),

  // Create a new post
  createPost: catchAsync(async (req, res, next) => {
    const { content, kind, relatedProject, image } = req.body;
    if (!content || !content.trim()) {
      return next(new AppError("Post content is required", 400));
    }

    const post = await Post.create({
      author: req.user._id,
      content: content.trim(),
      kind: kind || "general",
      relatedProject: relatedProject || undefined,
      image: image || undefined,
    });

    const populated = await Post.findById(post._id)
      .populate("author",         "userName profilePicture school fieldOfStudy")
      .populate("relatedProject", "title category projectType");

    res.status(201).json({ status: "success", data: { post: populated } });
  }),

  // Delete a post (author only)
  deletePost: catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    if (!post) return next(new AppError("Post not found", 404));
    if (post.author.toString() !== req.user._id.toString()) {
      return next(new AppError("Not authorized to delete this post", 403));
    }
    await post.deleteOne();
    res.status(200).json({ status: "success", message: "Post deleted" });
  }),

  // Toggle like on a post
  toggleLike: catchAsync(async (req, res, next) => {
    const post = await Post.findById(req.params.id);
    if (!post) return next(new AppError("Post not found", 404));

    const userId = req.user._id.toString();
    const idx = post.likes.findIndex((id) => id.toString() === userId);
    if (idx === -1) {
      post.likes.push(req.user._id);
    } else {
      post.likes.splice(idx, 1);
    }
    await post.save();

    res.status(200).json({
      status: "success",
      data: { likes: post.likes.length, liked: idx === -1 },
    });
  }),

  // Add a comment
  addComment: catchAsync(async (req, res, next) => {
    const { text } = req.body;
    if (!text || !text.trim()) {
      return next(new AppError("Comment text is required", 400));
    }

    const post = await Post.findById(req.params.id);
    if (!post) return next(new AppError("Post not found", 404));

    post.comments.push({ user: req.user._id, text: text.trim() });
    await post.save();

    const populated = await Post.findById(post._id)
      .populate("comments.user", "userName profilePicture");

    res.status(201).json({
      status: "success",
      data: { comments: populated.comments },
    });
  }),
};

export default postController;
