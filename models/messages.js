const mongoose = require("mongoose");

const MessageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
    },
    text: {
      type: String,
    },
    senderId: {
      type: String,
    },
    recieverId: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    user: {
      _id: {
        type: String,
      },
      avatar: {
        type: String,
      },
    },
  },
  { timestamps: true }
);
MessageSchema.pre("save", function (next) {
  this.user._id = this.senderId;
  next();
});

module.exports = mongoose.model("Message", MessageSchema);
