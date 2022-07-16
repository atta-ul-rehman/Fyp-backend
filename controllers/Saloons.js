const _ = require("lodash");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Saloonss = require("../models/Saloons");
const SaloonsPhotos = require("../models/RestaurantPhotos");
const cloudinary = require("../Cloudniry/cloudniryconfig");
const geocoder = require("../utils/geoencoder");

exports.createSaloons = asyncHandler(async (req, res, next) => {
  // Add user to req,body
  req.body.user = req.user.id;
  const Saloons = await Saloonss.create(req.body);

  res.status(201).json({
    success: true,
    data: Saloons,
  });
});

// @desc      Get single Saloons
// @route     Get /api/v1/res all Saloonss
// @route     GET /api/v1/res/:id
// @access    Public
exports.getSaloons = asyncHandler(async (req, res, next) => {
  const Saloons = await Saloonss.findById(req.params.id);

  if (!Saloons) {
    return next(
      new ErrorResponse(`Saloons not found with id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: Saloons,
  });
});

exports.getSaloonss = asyncHandler(async (req, res, next) => {
  res.status(200).json(res.advancedResults);
});

// @desc      Upload photo for Saloons
// @route     PUT /api/v1/Saloonss/:id/photo
// @access    Private
exports.SaloonsPhotoUpload = asyncHandler(async (req, res, next) => {
  const Saloons = await Saloonss.findById(req.params.id);
  if (!Saloons) {
    return next(
      new ErrorResponse(`Saloons not found with id of ${req.params.id}`, 404)
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
      folder: "SaloonsImages",
    });
    console.log(result);
    imageUp = result.secure_url;
    res = await SaloonsPhotos.create({
      image: imageUp,
      Saloon: req.params.id,
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

exports.deleteSaloons = asyncHandler(async (req, res, next) => {
  const Saloons = await Saloonss.findById(req.params.id);

  if (!Saloons) {
    return next(
      new ErrorResponse(`Saloons not found with id of ${req.params.id}`, 404)
    );
  }

  // Make sure user is Saloons owner

  Saloons.remove();

  res.status(200).json({ success: true, data: {} });
});

// @desc      Get bootcamps within a radius
// @route     GET /api/v1/res/radius/:zipcode/:distance
// @access    Private

exports.getSaloonssInRadius = asyncHandler(async (req, res, next) => {
  const { lati, lngi, distance } = req.params;

  // Get lat/lng from geocoder
  // Calc radius using radians
  // Divide dist by radius of Earth
  // Earth Radius = 3,963 mi / 6,378 km

  const Saloons = await Saloonss.find({
    location: {
      $geoWithin: {
        $centerSphere: [[lati, lngi], distance / 3963],
      },
    },
  });

  res.status(200).json({
    success: true,
    count: Saloons.length,
    data: Saloons,
  });
});

exports.getSaloonssPhotos = asyncHandler(async (req, res, next) => {
  const { id } = req.params;
  const Saloons_Photos = await SaloonsPhotos.find({ Saloons: id });
  if (!Saloons_Photos) {
    return next(
      new ErrorResponse(
        `SaloonsPhotos not found with id of ${req.params.id}`,
        404
      )
    );
  }

  res.status(200).json({
    success: true,
    count: Saloons_Photos.length,
    data: Saloons_Photos,
  });
});
