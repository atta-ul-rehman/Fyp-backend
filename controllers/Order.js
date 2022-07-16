const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Order = require("../models/Order2");
const Restaurants = require("../models/Restaurants");
const Saloons = require("../models/Saloons");

// @desc      Get orders
// @route     GET /api/v1/order
// @route     GET /api/v1/res/:resid/order   restarantOrders
// @route     GET /api/v1/user/:userid/order  userOrders
// @route     GET /api/v1/saloon/:saloonid/order  saloonOrders
// @access    Public
exports.getOrders = asyncHandler(async (req, res, next) => {
  let orders;
  if (req.params.resid) {
    orders = await Order.find({
      Restaurant: req.params.resid,
    })
      .populate({
        path: "user",
        select: "name DeliveryAddress",
      })
      .populate({
        path: "Restaurant",
        select: "restaurantName",
      });
    if (!orders) {
      return next(
        new ErrorResponse(
          `No order found with the id of ${req.params.resid}`,
          404
        )
      );
    }
    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } else if (req.params.userid) {
    orders = await Order.find({
      user: req.params.userid,
    })
      .populate({
        path: "Restaurant",
        select: "restaurantName",
      })
      .populate({
        path: "Saloon",
        select: "restaurantName",
      });
    if (!orders) {
      return next(
        new ErrorResponse(
          `No order found with the id of ${req.params.userid}`,
          404
        )
      );
    }
    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } else if (req.params.saloonid) {

    orders = await Order.find({
      Saloon: req.params.saloonid,
    }).populate({
      path: "Saloon",
      select: "restaurantName",
    });
    if (!orders) {
      return next(
        new ErrorResponse(
          `No order found with the id of ${req.params.userid}`,
          404
        )
      );
    }
    return res.status(200).json({
      success: true,
      count: orders.length,
      data: orders,
    });
  } else {
    return res.status(200).json(res.advancedResults);
  }
});

// @desc      Get single order
// @route     GET /api/v1/order/:id
// @access    Public
exports.getOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id).populate({
    path: "Restaurant",
    select: "name description",
  });

  if (!order) {
    return next(
      new ErrorResponse(`No order found with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: order,
  });
});

//@ api/v1/res/:resid/order
//post order
exports.addOrder = asyncHandler(async (req, res, next) => {
  console.log(req.params);
  let Restaurant;
  let id;
  if (req.params.resid) {
    req.body.Restaurant = req.params.resid;
    req.body.Saloon = null;
    id = req.params.resid;
    Restaurant = await Restaurants.findById(req.params.resid);
  } else if (req.params.saloonid) {
    req.body.Saloon = req.params.saloonid;
    id = req.params.saloonid;
    req.body.Restaurant = null;
    Restaurant = await Saloons.findById(req.params.saloonid);
  }
  req.body.user = req.user.id;
  if (!Restaurant) {
    return next(new ErrorResponse(`No Business with the id of ${id}`, 404));
  }
  const order = await Order.create(req.body);

  res.status(201).json({
    success: true,
    data: order,
  });
});

// @desc      Update order
// @route     PUT /api/v1/order/:id
// @access    Private
exports.updateOrderStatus = asyncHandler(async (req, res, next) => {
  let order = await Order.findById(req.params.id);

  if (!order) {
    return next(
      new ErrorResponse(`No order with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure order belongs to user or user is admin
  if (req.user.role == "admin") {
    return next(new ErrorResponse(`Not authorized to update order`, 401));
  }

  order = await Order.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({
    success: true,
    data: order,
  });
});

// @desc      Delete Order
// @route     DELETE /api/v1/Orders/:id
// @access    Private
exports.deleteOrder = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    return next(
      new ErrorResponse(`No Order with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure Order belongs to user or user is admin
  if (order.user.toString() !== req.user.id && req.user.role !== "admin") {
    return next(new ErrorResponse(`Not authorized to update Order`, 401));
  }

  await Order.remove();

  res.status(200).json({
    success: true,
    data: {},
  });
});
