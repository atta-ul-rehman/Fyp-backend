const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Conversation = require("../models/conversation");

//new conversaation
exports.newConversation = asyncHandler(async (req, res, next) => {
  const conversation = await Conversation.create(req.body);
  res.status(201).json({
    success: true,
    data: conversation,
  });
});

//get conversation of user

exports.getCoversation = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

//get conversation of two specific users

exports.updateCoversationStatus = asyncHandler(async (req, res, next) => {
  let conversation = await Conversation.findById(req.params.id);

  if (!conversation) {
    return next(
      new ErrorResponse(
        `No conversation with the id of ${req.params.conversationId}`,
        404
      )
    );
  }

  // Make sure conversation belongs to user or user is admin
  // if (conversation.user.toString() !== req.params.conversationId && req.user.role !== "admin") {
  //   return next(new ErrorResponse(`Not authorized to update conversation`, 401));
  // }

  conversation = await Conversation.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: conversation,
  });
});
