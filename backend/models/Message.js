import mongoose from "mongoose";

const messageSchema = new mongoose.Schema({
  project: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: {
    type: String,
    required: [true, "Message text is required"],
    maxlength: [1000, "Message cannot exceed 1000 characters"],
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  // Tracks which users have fetched/read this message
  // Used to show "Seen" (✓✓) vs "Delivered" (✓) status on the sender's side
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: [],
  }],
});

// Index for efficient querying of messages by project
messageSchema.index({ project: 1, createdAt: 1 });

const Message = mongoose.model("Message", messageSchema);
export default Message;
