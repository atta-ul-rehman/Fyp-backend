const _ = require("lodash");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Restaurants = require("../models//Restaurants");
const RestaurantPhotos = require("../models/RestaurantPhotos");
const cloudinary = require("../Cloudniry/cloudniryconfig");
const geocoder = require("../utils/geoencoder");
const addRes = require('../models/reqForCreateRestaurant');

exports.createRestaurant = asyncHandler(async (req, res, next) => {
  // Add user to req,body

  const Restaurant = await Restaurants.create(req.body);

  res.status(201).json({
    success: true,
    data: Restaurant,
  });
});


exports.reqForCreateRestaurant = asyncHandler(async (req, res, next) => {
  // Add user to req,body
req.body.user=req.user.id
  const Restaurant = await addRes.create(req.body);

  res.status(201).json({
    success: true,
    data: Restaurant,
  });
});

// @desc      Get single Restaurant
// @route     Get /api/v1/res/addbusiness all restaurants
// @route     GET /api/v1/res/addbusiness/:id
// @access    Public
exports.getAddResReq = asyncHandler(async (req, res, next) => {
  const Restaurant = await addRes.findById(req.params.id);

  if (!Restaurant) {
    return next(
      new ErrorResponse(`Restaurant not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: Restaurant,
  });
});


// @desc      Get single Restaurant
// @route     Get /api/v1/res all restaurants
// @route     GET /api/v1/res/:id
// @access    Public
exports.getRestaurant = asyncHandler(async (req, res, next) => {
  const Restaurant = await Restaurants.findById(req.params.id);

  if (!Restaurant) {
    return next(
      new ErrorResponse(`Restaurant not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: Restaurant,
  });
});

exports.getRestaurants = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Upload photo for Restaurant
// @route     PUT /api/v1/Restaurants/:id/photo
// @access    Private
exports.RestaurantPhotoUpload = asyncHandler(async (req, res, next) => {
  const Restaurant = await Restaurants.findById(req.params.id);
  if (!Restaurant) {
    return next(
      new ErrorResponse(`Restaurant not found with id of ${req.params.id}`, 404)
    );
  }
  // Make sure uploded is a file
  if (!req.files) {
    return next(new ErrorResponse(`Please upload a file`, 400));
  }
  // Create custom filename
  let res2;
  let { files } = req;
  _.forEach(files, async (file) => {
    const result = await cloudinary.uploader.upload(file.path, {
      folder: "RestaurantsImages",
    });
    console.log(result);
    imageUp = result.secure_url;
    res = await RestaurantPhotos.create({
      image: imageUp,
      Restaurant: req.params.id,
    });
    //   let imagePath = file.path.replace("public", baseURL);
    //  imagePath = imagePath.split('src')[1].substring(1, imagePath.length);
  });

  res.status(200).json({
    success: true,
    data: res2,
  });
});

// @desc      Delete bootcamp
// @route     DELETE /api/v1/res/:id
// @access    Private

exports.deleteRestaurant = asyncHandler(async (req, res, next) => {
  const Restaurant = await Restaurants.findById(req.params.id);

  if (!Restaurant) {
    return next(
      new ErrorResponse(`Restaurant not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is Restaurant owner

  Restaurant.remove();

  res.status(200).json({ success: true, data: {} });
});

// @desc      Get bootcamps within a radius
// @route     GET /api/v1/res/radius/:zipcode/:distance
// @access    Private

exports.getRestaurantsInRadius = asyncHandler(async (req, res, next) => {
  const { lati, lngi, distance } = req.params;

  // Get lat/lng from geocoder
  // Calc radius using radians
  // Divide dist by radius of Earth
  // Earth Radius = 3,963 mi / 6,378 km

  const Restaurant = await Restaurants.find({
    location: {
      $geoWithin: {
        $centerSphere: [[lati, lngi], distance / 3963],
      },
    },
  });

  res.status(200).json({
    success: true,
    count: Restaurant.length,
    data: Restaurant,
  });
});

exports.getRestaurantsPhotos = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const Restaurant_Photos = await RestaurantPhotos.find({ Restaurant: id });
  if (!Restaurant_Photos) {
    return next(
      new ErrorResponse(
        `RestaurantPhotos not found with id of ${req.params.id}`,
        404
      )
    );
  }

  res.status(200).json({
    success: true,
    count: Restaurant_Photos.length,
    data: Restaurant_Photos,
  });
});
