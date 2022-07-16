const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Message = require("../models/messages");
//new Message
//  Get this route @/api/v1/message
exports.newMessage = asyncHandler(async (req, res, next) => {
  const newMessage = new Message(req.body);
  const savedMessage = await newMessage.save();
  //const newMessage = new Message(req.body);

  res.status(201).json({ succes: true, data: savedMessage });
});

//get conversation of two specific users

// @desc      Update order
// @route     PUT /api/v1/order/:id
// @access    Private
exports.updateMessageStatus = asyncHandler(async (req, res, next) => {
  let order = await Message.find({
    conversationId: req.params.conversationId,
  });

  if (!order) {
    return next(
      new ErrorResponse(
        `No order with the id of ${req.params.conversationId}`,
        404
      )
    );
  }

  // Make sure order belongs to user or user is admin
  // if (order.user.toString() !== req.params.conversationId && req.user.role !== "admin") {
  //   return next(new ErrorResponse(`Not authorized to update order`, 401));
  // }

  order = await Message.updateMany(
    {
      conversationId: req.params.conversationId,
    },
    req.body,
    {
      new: true,
      runValidators: true,
    }
  );

  res.status(200).json({
    success: true,
    data: order,
  });
});

//get messages with conversation id

exports.getMessages = asyncHandler(async (req, res, next) => {
  if (req.params.conversationId) {
    const messages = await Message.find({
      conversationId: req.params.conversationId,
    });
    if (!messages) {
      return next(
        new ErrorResponse(
          `messages not found with id of ${req.params.conversationId}`,
          404
        )
      );
    }
    res.status(201).json({ succes: true, data: messages });
  } else {
    return res.status(200).json(res.advancedResults);
  }
});
