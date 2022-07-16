const express = require("express");
const {
  getReviews,
  deleteReview,
  getReview,
  updateReview,
  addReviewWithImage,
} = require("../controllers/Reviews");

const router = express.Router({ mergeParams: true });
const review = require("../models/Reviews");
const { protect, authorize } = require("../middleware/auth");
const advancedResults = require("../middleware/advanceResults");
const upload = require("../utils/cloundinaryPhotoupload");
router
  .route("/")
  .get(
    advancedResults(review, {
      path: "Restaurant",
      select: "restaurantName description",
    },
    {
      path:"user",
    select:"email name"
    }),

    getReviews
  )
  .post(
    protect,
    authorize("user", "admin"),
    upload.single("image"),
    addReviewWithImage
  );

router
  .route("/:id")
  .get(getReview)
  .put(protect, authorize("user"), updateReview)
  .delete(deleteReview);

module.exports = router;
