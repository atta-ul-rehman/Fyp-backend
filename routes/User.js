const express = require("express");
const { getallUsers } = require("../controllers/User");
const OrderRouter = require("./Order");
const Users = require("../models/User");
const advancedResults = require("../middleware/advanceResults");

const router = express.Router();
router.use("/:userid/order", OrderRouter);

router.route("/").get(advancedResults(Users), getallUsers);

module.exports = router;
