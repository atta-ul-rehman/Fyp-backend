const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const User = require("../models/User");
//new Message
//  Get this route @/api/v1/message

//get all users

exports.getallUsers = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

//get single use
