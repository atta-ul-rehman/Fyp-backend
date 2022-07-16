const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const Review = require("../models/Reviews");
const Restaurants = require("../models/Restaurants");
const cloudinary = require("../Cloudniry/cloudniryconfig");
const Saloons = require("../models/Saloons");
// @desc      Get reviews
// @route     GET /api/v1/reviews
// @route     GET /api/v1/res/:resid/reviews
// @access    Public
exports.getReviews = asyncHandler(async (req, res, next) => {
  let id;
  if (req.params.resid) {
    id = req.params.resid;
  } else {
    id = req.params.saloonid;
  }
  if (id) {
    const reviews = await Review.find({
      Restaurant: req.params.resid,
    }).populate({
      path: "user",
      select: "name image email",
    });
    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc      Get single review
// @route     GET /api/v1/reviews/:id
// @access    Public
exports.getReview = asyncHandler(async (req, res, next) => {
  let id;
  if (req.params.resid) {
    id = req.params.resid;
  } else if(req.params.saloonid) {
    id = req.params.saloonid;
  }
  else{
    id=req.params.id
  }
  const review = await Review.findById(id).populate({
    path: "Restaurant",
    select: "name description",
  });

  if (!review) {
    return next(
      new ErrorResponse(`No review found with the id of ${req.params.id}`, 404)
    );
  }

  res.status(200).json({
    success: true,
    data: review,
  });
});

exports.ReviewSentiment = asyncHandler(async (req, res, next) => {
  let id;
  if (req.params.resid) {
    id = req.params.resid;
  } else {
    id = req.params.saloonid;
  }
  if (id) {
    const reviews = await Review.find({
      Restaurant: req.params.resid,
    }).populate({
      path: "user",
      select: "name image email",
    });
    return res.status(200).json({
      success: true,
      count: reviews.length,
      data: reviews,
    });
  } else {
    res.status(200).json(res.advancedResults);
  }
});

// @desc      Add review
// @route     POST /api/v1/res/:resid/reviews
// @access    Private
exports.addReview = asyncHandler(async (req, res, next) => {
  let business;
  if (req.params.resid) {
    req.body.Restaurant = req.params.resid;
    business = await Restaurants.findById(req.params.resid);
  } else {
    req.body.Saloon = req.params.saloonid;
    business = await Saloons.findById(req.params.resid);
  }
  req.body.user = req.user.id;

  if (!business) {
    return next(
      new ErrorResponse(`No Restaurant with the id of ${req.params.resid}`, 404)
    );
  }

  const review = await Review.create(req.body);

  res.status(201).json({
    success: true,
    data: review,
  });
});

// @desc      Update review
// @route     PUT /api/v1/reviews/:id
// @access    Private
exports.updateReview = asyncHandler(async (req, res, next) => {
  let review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
    );
  }
  if (req.body.like == "like") {
    Review.findByIdAndUpdate(
      req.params.id,
      {
        $push: { likes: req.user.id },
      },
      {
        new: true,
      }
    ).exec((err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      } else {
        res.status(200).json({
          success: true,
          data: result,
        });
      }
    });
  } else if (req.body.report == true) {
    
    Review.findByIdAndUpdate(
      req.params.id,
      {
        $push: { ReportReview: [{user:req.user.id,des:req.body.des}] },
      },
      {
        new: true,
      }
    ).exec((err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      } else {
        res.status(200).json({
          success: true,
          data: result,
        });
      }
    });
  } else if (req.body.report == false) {
    Review.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { ReportReview: req.user.id },
      },
      {
        new: true,
      }
    ).exec((err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      } else {
        res.status(200).json({
          success: true,
          data: result,
        });
      }
    });
  } else {
    Review.findByIdAndUpdate(
      req.params.id,
      {
        $pull: { likes: req.user.id },
      },
      {
        new: true,
      }
    ).exec((err, result) => {
      if (err) {
        return res.status(422).json({ error: err });
      } else {
        res.status(200).json({
          success: true,
          data: result,
        });
      }
    });
  }
  // Make sure review belongs to user or user is admin
});
// reaction addition

// @desc      Delete review
// @route     DELETE /api/v1/reviews/:id
// @access    Private
exports.deleteReview = asyncHandler(async (req, res, next) => {
  const review = await Review.findById(req.params.id);

  if (!review) {
    return next(
      new ErrorResponse(`No review with the id of ${req.params.id}`, 404)
    );
  }

  // Make sure review belongs to user or user is admin
  // if (review.user.toString() !== req.user.id && req.user.role !== "admin") {
  //   return next(new ErrorResponse(`Not authorized to update review`, 401));
  // }

  
  await review.remove();

  res.status(200).json({
    success: true,
    data: "deleted succesfully",
  });
});

//@route api/v1/res/:resid/reviews
// add review by photo

exports.addReviewWithImage = asyncHandler(async (req, res, next) => {
  const { text, title, rating } = req.body;
  let resid;
  let saloonid;
  console.log(req.params);
  if (req.params.resid) {
    resid = req.params.resid;
    saloonid = null;
  } else if (req.params.saloonid) {
    saloonid = req.params.saloonid;
    resid = null;
  }
  // const image = req.file.filename;

  //console.log(req.file.path);
  //Create user
  let uploadResponse;
  if (req.file) {
    uploadResponse = await cloudinary.uploader.upload(req.file.path, {
      folder: "ml_reviews",
    });
    uploadResponse = uploadResponse.secure_url;
  }

  if (!req.file) {
    uploadResponse = null;
  }
  // console.log(uploadResponse);
  await Review.create({
    text: text,
    title: title,
    rating: rating,
    image: uploadResponse,
    Restaurant: resid,
    Saloon: saloonid,
    user: req.user.id,
  });
  res.status(201).json({
    success: true,
    data: "review added successfully",
  });
});

// @desc      Update order
// @route     PUT /api/v1/order/:id
// @access    Private
