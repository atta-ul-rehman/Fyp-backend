const crypto = require("crypto");
const ErrorResponse = require("../utils/errorResponse");
const asyncHandler = require("../middleware/async");
const cloudinary = require("../Cloudniry/cloudniryconfig");
const sendEmail = require("../utils/sendEmail");
const User = require("../models/User");
const geocoder = require("../utils/geoencoder");
const path = require("path");
const EmailVerification = require("../models/emailVerification");
// @desc      Register user
// @route     POST /api/v1/auth/register
// @access    Public
exports.register = asyncHandler(async (req, res, next) => {
  const { name, email, password, role, address } = req.body;
  let user;
  // Create user
  if (!req.body.resendEmail) {
    user = await User.create({
      name,
      email,
      password,
      role,
      address,
    });
  } else {
    await User.deleteOne({ email });
    user = await User.create({
      name,
      email,
      password,
      role,
      address,
    });
  }
  let userEmailVerify = await EmailVerification.create({ user: user._id });
  // Get reset token
  const resetToken = userEmailVerify.getVerificationToken();
  await userEmailVerify.save();
  // Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/verifyEmail/${resetToken}`;
  const message = "Verify Your Email";
  const url = resetUrl;
  try {
    await sendEmail({
      email: user.email,
      subject: "Email Verification",
      message,
      url,
    });
    res.status(200).json({
      success: true,
      data: userEmailVerify,
    });
  } catch (err) {
    console.log(err);
    userEmailVerify.deleteOne({ user: user._id });
    return next(new ErrorResponse("Email could not be sent", 500));
  }
});

//Google sign in

exports.registerGoogle = asyncHandler(async (req, res, next) => {
  const { name, email, verified, role } = req.body;

  // const image = req.file.filename;
  //console.log(req.body);
  //Create user
  const result = await cloudinary.uploader.upload(req.file.path, {
    folder: "users",
    width: 500,
    height: 500,
    crop: "fill",
  });

  try {
    const user = await User.create({
      name: name,
      email: email,
      image: result.url,
      verified: verified,
      role: role,
    });
    sendTokenResponse(user, 200, res);
  } catch (error) {
    return next(new ErrorResponse(error.message, 400));
  }
});

// @desc      Login user
// @route     POST /api/v1/auth/login
// @access    Public

exports.loginUser = asyncHandler(async (req, res, next) => {
  const { email, password, role } = req.body;

  // Validate emil & password
  if (!email || !password) {
    return next(new ErrorResponse("Please provide an email and password", 400));
  }

  // Check for user
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return next(new ErrorResponse("Invalid credentials no user found", 401));
  }
  if (user.role !== role) {
    return next(new ErrorResponse("User Role is not authorized", 401));
  }
  // Check if password matches
  const isMatch = await user.matchPassword(password);

  if (user.verified != true) {
    let userEmailVerify = await EmailVerification.findOne({ user: user._id });
    if (!userEmailVerify) {
      return next(new ErrorResponse("Please Register Yourself to Login", 401));
    }
    const resetToken = userEmailVerify.getVerificationToken();
    await userEmailVerify.save();
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/api/v1/auth/verifyEmail/${resetToken}`;
    const message = "Verify Your Email";
    const url = resetUrl;
    try {
      await sendEmail({
        email: user.email,
        subject: "Email Verification",
        message,
        url,
      });
      return res.status(200).json({
        success: true,
        data: userEmailVerify,
      });
    } catch (err) {
      console.log(err);
      userEmailVerify.verificationToken = undefined;
      userEmailVerify.verificationTokenExpires = undefined;
      return next(new ErrorResponse("Email could not be sent", 500));
    }
  }
  if (!isMatch) {
    return next(new ErrorResponse("Invalid credentials", 401));
  }

  sendTokenResponse(user, 200, res);
});

// @desc      Log user out / clear cookie
// @route     GET /api/v1/auth/logout
// @access    Private
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    success: true,
    data: {},
  });
});

// @desc      Get current logged in user
// @route     POST /api/v1/auth/me
// @access    Private
exports.getMe = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).populate({
    path: "Restaurant",
    select: "name",
  });

  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      Update user details
// @route     PUT /api/v1/auth/updatedetails
// @access    Private
exports.updateDetails = asyncHandler(async (req, res, next) => {
  let Delivery;
  let user;
  if (req.body.lat) {
    Delivery = await geocoder.reverse({
      lat: req.body.lat,
      lon: req.body.lng,
    });
    user = await User.findByIdAndUpdate(
      req.user.id,
      { DeliveryAddress: Delivery[0].formattedAddress },
      {
        new: true,
        runValidators: true,
      }
    );
  } else if(req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "users",
        width: 500,
        height: 500,
        crop: "fill",
      });
      user = await User.findByIdAndUpdate(req.user.id,{image:result.url}, {
        new: true,
        runValidators: true,
      });
    }
  else{
    user = await User.findByIdAndUpdate(req.user.id, req.body, {
      new: true,
      runValidators: true,
    });
  }
  res.status(200).json({
    success: true,
    data: user,
  });
});

// @desc      Update password
// @route     PUT /api/v1/auth/updatepassword
// @access    Private
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user.id).select("+password");

  // Check current password
  if (!(await user.matchPassword(req.body.currentPassword))) {
    return next(new ErrorResponse("Password is incorrect", 401));
  }

  user.password = req.body.newPassword;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc      Forgot password
// @route     POST /api/v1/auth/forgotpassword
// @access    Public

exports.forgotPassword = asyncHandler(async (req, res, next) => {
  const user = await User.findOne({ email: req.body.email });

  if (!user) {
    return next(new ErrorResponse("There is no user with that email", 404));
  }

  // Get reset token
  const resetToken = user.getResetPasswordToken();

  await user.save({ validateBeforeSave: false });

  // Create reset url
  const resetUrl = `${req.protocol}://${req.get(
    "host"
  )}/api/v1/auth/resetpassword/${resetToken}`;

  const message = resetUrl;
  try {
    await sendEmail({
      email: user.email,
      subject: "Password reset token",
      message,
    });

    res
      .status(200)
      .json({ success: true, data: "Email sent", resettoken: resetToken });
  } catch (err) {
    console.log(err);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    await user.save({ validateBeforeSave: false });

    return next(new ErrorResponse("Email could not be sent", 500));
  }

  // res.status(200).json({
  //   success: true,
  //   data: user,
  // });
});

// @desc      Reset password
// @route     PUT /api/v1/auth/resetpassword/:resettoken
// @access    Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const resetPasswordToken = crypto
    .createHash("sha256")
    .update(req.params.resettoken)
    .digest("hex");

  const user = await User.findOne({
    resetPasswordToken,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new ErrorResponse("Invalid token", 400));
  }

  // Set new password
  user.password = req.body.password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;
  await user.save();

  sendTokenResponse(user, 200, res);
});

// @desc      Verify email
// @route     PUT /api/v1/auth/verifyEmail/:resettoken
// @access    Public

exports.emailVerified = asyncHandler(async (req, res, next) => {
  // Get hashed token
  const verificationToken = crypto
    .createHash("sha256")
    .update(req.params.verifytoken)
    .digest("hex");
  const user = await EmailVerification.findOne({
    verificationToken,
    verificationTokenExpires: { $gt: Date.now() },
  });

  if (!user) {
    return res.sendFile(
      path.join(__dirname, "../htmlPages/VerifiedError.html")
    );
  } else {
    // Set verified to true
    await User.findByIdAndUpdate({ _id: user.user }, { verified: true });
    let userSave = await EmailVerification.deleteOne({ user: user.user });
    if (userSave) {
      return res.sendFile(path.join(__dirname, "../htmlPages/Verified.html"));
    }
  }
});

// Get token from model, create cookie and send response
const sendTokenResponse = (user, statusCode, res) => {
  // Create token
  const token = user.getSignedJwtToken();

  const options = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000
    ),
    httpOnly: true,
  };

  if (process.env.NODE_ENV === "production") {
    options.secure = true;
  }

  res.status(statusCode).cookie("token", token, options).json({
    success: true,
    token,
  });
};
