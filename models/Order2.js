const mongoose = require("mongoose");

const OrderSchema = new mongoose.Schema({
  productName: {
    type: String,
    trim: true,
    maxlength: 100,
  },
  productPrice: {
    type: Number,
  },
  prefernceData: [
    {
      name: {
        type: String,
      },
      price: {
        type: Number,
      },
      id: {
        type: Number,
      },
    },
  ],
  totalPrice: {
    type: Number,
  },
  quantity: {
    type: [Number],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  RestName: {
    type: String,
  },
  Status: {
    type: String,
    enum: [
      "placed",
      "confirmed",
      "prepared",
      "deliverd",
      "completed",
      "canceled",
    ],
    default: "placed",
  },
  Restaurant: {
    type: mongoose.Schema.ObjectId,
    ref: "Restaurants",
  },
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
  payment: {
    type: String,
  },
  canView: {
    user: {
      type: Boolean,
      default: true,
    },
    Restaurant: {
      type: Boolean,
      default: true,
    },
    Saloon: {
      type: Boolean,
      default: true,
    },
  },
  Saloon: {
    type: mongoose.Schema.ObjectId,
    ref: "Saloons",
  },
  address: {
    type: String,
  },
  zipCode: {
    type: Number,
  },
  Timings: {
    type: String,
  },
  SaloonService: {
    type: String,
  },
  SaloonDetails: {
    type: String,
  },
  Reservation: {
    time: {
      type: String,
    },
    person: {
      type: Number,
    },
    date: {
      type: Date,
    },
  },
});

OrderSchema.pre("save", function (next) {
  const total = this?.prefernceData
    .map((e) => e.price)
    .reduce((pre, next) => pre + next, 0);
  this.totalPrice = this.productPrice + total;
  next();
});
module.exports = mongoose.model("Order2", OrderSchema);
