const mongoose = require("mongoose");
const slugify = require("slugify");
const geocoder = require("../utils/geoencoder");

const SaloonsSchema = new mongoose.Schema(
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
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please add a valid email",
      ],
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
      min: [0, "Rating must be at least 1"],
      max: [5, "Rating must can not be more than 10"],
      default: 0,
    },
    discount: {
      type: Number,
    },
    totalReviews: {
      type: Number,
      default: 0,
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

SaloonsSchema.pre("save", async function (next) {
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

// Create Saloons slug from the name
SaloonsSchema.pre("save", function (next) {
  this.slug = slugify(this.restaurantName, { lower: true });
  next();
});

// Geocode & create location field

// Do not save address in DB

// Cascade delete courses when a Saloons is deleted
SaloonsSchema.pre("remove", async function (next) {
  await this.model("Reviews").deleteMany({ Saloon: this._id });
  next();
});

module.exports = mongoose.model("Saloons", SaloonsSchema);
