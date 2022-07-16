const mongoose = require("mongoose");
const RestaurantPhotosSchema = new mongoose.Schema(
  {
    image: {
      type: String,
    },
    Restaurant: {
      type: mongoose.Schema.ObjectId,
      ref: "Restaurants",
    },
    Saloon: {
      type: mongoose.Schema.ObjectId,
      ref: "Saloons",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("RestaurantPhotos", RestaurantPhotosSchema);
