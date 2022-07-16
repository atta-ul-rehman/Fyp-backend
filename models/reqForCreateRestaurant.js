const mongoose = require("mongoose");
const reqForCreateRestaurant = new mongoose.Schema({
  name: {
    type: String,
  },
  
 catagory: { type: String,  trim: true },
 cnic: { type: String, trim: true },
 location: { type: [String], trim: true },
 user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
})
module.exports = mongoose.model("addRes", reqForCreateRestaurant);
