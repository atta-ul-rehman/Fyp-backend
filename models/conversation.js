const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    members: {
      type: Array,
    },
    conversationId: {
      type: String,
      unique: true,
    },
    canView: {
      user: {
        type: Boolean,
        default: true,
      },
      Restaurant: {
        type: Boolean,
        default: true,
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Conversation", ConversationSchema);
