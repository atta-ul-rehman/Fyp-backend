const express = require("express");
const {
  register,
  logout,
  getMe,
  resetPassword,
  updateDetails,
  updatePassword,
  registerGoogle,
  forgotPassword,
  loginUser,
  emailVerified,
} = require("../controllers/auth");

const router = express.Router();
const upload = require("../utils/cloundinaryPhotoupload");

const { protect } = require("../middleware/auth");

router.post("/register", register);
router.post("/registerGoogle", upload.single("image"), registerGoogle);
router.post("/login", loginUser);
router.get("/logout", logout);
router.get("/me", protect, getMe);
router.post("/forgetpassword", forgotPassword);
router.put("/updatedetails", protect,upload.single("image"), updateDetails);
router.put("/updatepassword", protect, updatePassword);
router.put("/resetpassword/:resettoken", resetPassword);
router.get("/verifyEmail/:verifytoken", emailVerified);
module.exports = router;
