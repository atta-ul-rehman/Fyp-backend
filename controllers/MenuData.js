const asyncHandler = require("../middleware/async");
const MenuData = require("../models//MenuData");
const Restaurants = require("../models//Restaurants");
const ErrorResponse = require("../utils/errorResponse");

//Create menu data at /api/v1/res/:resid/MenuData
exports.createMenu = asyncHandler(async (req, res, next) => {
  // Add user to req,body
  req.body.Restaurant = req.params.resid;

  const restaurant = await Restaurants.findById(req.params.resid);

  if (!restaurant) {
    return next(
      new ErrorResponse(
        `No restaurant with the id of ${req.params.bootcampId}`
      ),
      404
    );
  }
  const Menus = await MenuData.create(req.body);
  res.status(201).json({
    success: true,
    data: Menus,
  });
});

// @desc      Get MenuData
// @route     GET /api/v1/menu
// @route     GET /api/v1/res/:resid/menu
// @access    Public
exports.getMenuData = asyncHandler(async (req, res, next) => {
  let query;
  if (req.params.resid) {
    query = await MenuData.find({ Restaurant: req.params.resid });
  } else {
    query = await MenuData.find().populate({
      path: "Restaurant",
      select: "name description",
    });
  }
  const menu = query;
  res.status(200).json({
    success: true,
    count: menu.length,
    data: menu,
  });
});

// @desc      Get SingleMenuData
// @route     GET /api/v1/menu/:id
// @access    Public
exports.getSingleMenuData = asyncHandler(async (req, res, next) => {
  let query;

  query = await MenuData.findById(req.params.id);
  if (!query) {
    return next(
      new ErrorResponse(`messages not found with id of ${req.params.id}`, 404)
    );
  }
  const menu = query;
  res.status(200).json({
    success: true,
    count: menu.length,
    data: menu,
  });
});
