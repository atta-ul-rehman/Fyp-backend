const express = require("express");
const Order = require("../models/Order2");
const {
  addOrder,
  getOrders,
  getOrder,
  updateOrderStatus,
  deleteOrder,
} = require("../controllers/Order");
const advancedResults = require("../middleware/advanceResults");
const order2=require("../models/Order2")
const { protect, authorize } = require("../middleware/auth");
const router = express.Router({ mergeParams: true });
router
  .route("/")
  .get(advancedResults(order2,{
    path:"Restaurant",
    select:"restaurantName"
  },{
    path:"user",
    select:"email"
  }),getOrders)
  .post(protect, authorize("user", "admin"), addOrder);

router
  .route("/:id")
  .get(getOrder)
  .put(protect, authorize("user", "admin"), updateOrderStatus)
  .delete(protect, authorize("user", "admin"), deleteOrder);
module.exports = router;
