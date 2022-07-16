const express = require("express");
const {
  getCoversation,
  newConversation,
  updateCoversationStatus,
} = require("../controllers/Conversation");
const advancedResults = require("../middleware/advanceResults");
const conversation = require("../models/conversation");
const router = express.Router();

router
  .route("/")
  .get(advancedResults(conversation), getCoversation)
  .post(newConversation);
router.route("/:id").put(updateCoversationStatus);
module.exports = router;
