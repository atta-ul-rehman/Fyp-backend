const express = require("express");
const {
  getMessages,
  newMessage,
  updateMessageStatus,
} = require("../controllers/Messages");
const advancedResults = require("../middleware/advanceResults");
const Messages = require("../models/messages");
const router = express.Router();

router.route("/").get(advancedResults(Messages), getMessages).post(newMessage);
router.route("/:conversationId").get(getMessages).put(updateMessageStatus);

module.exports = router;
