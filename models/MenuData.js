const mongoose = require("mongoose");
const MenuDataSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please add a name"],
    unique: true,
    trim: true,
    maxlength: [50, "Name can not be more than 50 characters"],
  },
  meal: { type: String, trim: true },
  price: { type: Number, trim: true },
  image: { type: String, default: "no-img.jpg", trim: true },
  details: { type: String, trim: true },
  preferenceTitle: { type: [String], trim: true },
  pereferencedata: [
    [
      {
        name: {
          type: String,
          trim: true,
        },
        price: {
          type: Number,
          trim: true,
        },
        checked: {
          type: Boolean,
          default: false,
        },
      },
    ],
  ],
  minimumQuantity: {
    type: [Number],
  },
  counter: {
    type: [Number],
  },
  required: {
    type: [Boolean],
  },
  type: {
    type: String,
  },
  Restaurant: {
    type: mongoose.Schema.ObjectId,
    ref: "Restaurants",
    required: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("MenuData", MenuDataSchema);
