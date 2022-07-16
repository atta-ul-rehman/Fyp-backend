const mongoose = require("mongoose");
const crypto = require("crypto");

const EmailSchema = new mongoose.Schema({
  verificationToken: String,
  verificationTokenExpires: Date,
  user: {
    type: mongoose.Schema.ObjectId,
    ref: "User",
    required: true,
  },
});

EmailSchema.methods.getVerificationToken = function () {
  // Generate token
  const resetToken = crypto.randomBytes(20).toString("hex");
  // Hash token and set to resetPasswordToken field
  this.verificationToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  // Set expire
  let date2 = new Date();
  date2 = new Date(date2.getTime() + 1 * 60000);
  this.verificationTokenExpires = date2;
  return resetToken;
};

module.exports = mongoose.model("EmailVerification", EmailSchema);
