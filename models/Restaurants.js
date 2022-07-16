const mongoose = require("mongoose");
const slugify = require("slugify");
const geocoder = require("../utils/geoencoder");

const RestaurantsSchema = new mongoose.Schema(
  {
    restaurantName: {
      type: String,
      required: [true, "Please add"],
      unique: true,
      trim: true,
      maxlength: [50, "can not be more than 50 characters"],
    },

    farAway: {
      type: String,
      trim: true,
    },
    businessAddress: {
      type: String,
      trim: true,
    },
    slug: String,
    description: {
      type: String,
      required: [true, "Please add a description"],
      maxlength: [500, "Description can not be more than 500 characters"],
    },
    website: {
      type: String,
      match: [
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/,
        "Please use a valid URL with HTTP or HTTPS",
      ],
    },
    phone: {
      type: String,
      maxlength: [20, "Phone number can not be longer than 20 characters"],
    },
    email: {
      type: String,
    },
    averageCost: Number,
    deliveryTime: {
      type: Number,
      trim: true,
    },
    collectTime: {
      type: Number,
      trim: true,
    },
    foodtype: {
      type: String,
      trim: true,
    },
    photo: {
      type: String,
      default: "no-photo.jpg",
    },
    averageRating: {
      type: Number,
      min: [1, "Rating must be at least 1"],
      max: [5, "Rating must can not be more than 10"],
    },
    discount: {
      type: Number,
    },
    totalReviews: {
      type: Number,
    },
    location: {
      // GeoJSON Point
      type: {
        type: String,
        enum: ["Point"],
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
      },
      formattedAddress: String,
      street: String,
      city: String,
      state: String,
      zipcode: String,
      country: String,
    },
    averagePrice: {
      type: Number,
    },
    foodtype: {
      type: String,
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: true,
    },
  },

  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

RestaurantsSchema.pre("save", async function (next) {
  const loc = await geocoder.geocode(this.businessAddress);
  this.location = {
    type: "Point",
    coordinates: [loc[0].longitude, loc[0].latitude],
    formattedAddress: loc[0].formattedAddress,
    street: loc[0].streetName,
    city: loc[0].city,
    state: loc[0].stateCode,
    zipcode: loc[0].zipcode,
    country: loc[0].countryCode,
  };

  // Do not save address in DB
  this.address = undefined;
  next();
});

// Create Restaurants slug from the name
RestaurantsSchema.pre("save", function (next) {
  this.slug = slugify(this.restaurantName, { lower: true });
  next();
});

// Geocode & create location field

// Do not save address in DB

// Cascade delete courses when a Restaurants is deleted
RestaurantsSchema.pre("remove", async function (next) {
  console.log(`MenuData being removed from Restaurants ${this._id}`);
  await this.model("MenuData").deleteMany({ Restaurant: this._id });
  await this.model("Reviews").deleteMany({ Restaurant: this._id });
  next();
});

// Reverse populate with virtuals
RestaurantsSchema.virtual("Menu", {
  ref: "MenuData",
  localField: "_id",
  foreignField: "Restaurant",
  justOne: false,
});

module.exports = mongoose.model("Restaurants", RestaurantsSchema);
