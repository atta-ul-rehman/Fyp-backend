const mongoose = require("mongoose");

const ReviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      trim: true,
      required: [true, "Please add a title for the review"],
      maxlength: 100,
    },
    text: {
      type: String,
      required: [true, "Please add some text"],
    },
    rating: {
      type: Number,
      min: 1,
      max: 10,
      required: [true, "Please add a rating between 1 and 10"],
    },
    image: {
      type: String,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    ReportReview: [{
      user:{ type: mongoose.Schema.ObjectId, ref: "User" },
      des:{
        type: String,
      },
   } ],
    Restaurant: {
      type: mongoose.Schema.ObjectId,
      ref: "Restaurants",
    },
    Saloon: {
      type: mongoose.Schema.ObjectId,
      ref: "Saloons",
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
    likes: [{ type: mongoose.Schema.ObjectId, ref: "User" }],
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
// Prevent user from submitting more than one review per Restaurant
ReviewSchema.index({ Restaurant: 1, user: 1 }, { unique: true });

// Static method to get avg rating and save
ReviewSchema.statics.getAverageRating = async function (RestaurantId) {
  const obj = await this.aggregate([
    {
      $match: { Restaurant: RestaurantId },
    },
    {
      $group: {
        _id: "$Restaurants",
        averageRating: { $avg: "$rating" },
      },
    },
  ]);

  try {
    await this.model("Restaurants").findByIdAndUpdate(RestaurantId, {
      averageRating: Math.ceil(obj[0].averageRating),
    });
  } catch (err) {
    console.error(err);
  }
};

ReviewSchema.statics.getTotalRating = async function (RestaurantId) {
  const obj = await this.aggregate([
    {
      $match: { Restaurant: RestaurantId },
    },
    {
      $group: {
        _id: "$Restaurants",
        totalReviews: { $sum: "$rating" },
      },
    },
  ]);

  try {
    await this.model("Restaurants").findByIdAndUpdate(RestaurantId, {
      totalReviews: obj[0].totalReviews,
    });
  } catch (err) {
    console.error(err);
  }
};

// Call getAverageCost after save
ReviewSchema.post("save", function () {
  this.constructor.getAverageRating(this.Restaurant);
  this.constructor.getTotalRating(this.Restaurant);
});

// Call getAverageCost before remove
ReviewSchema.pre("remove", function () {
  this.constructor.getAverageRating(this.Restaurant);
  this.constructor.getTotalRating(this.Restaurant);
});

module.exports = mongoose.model("Reviews", ReviewSchema);
