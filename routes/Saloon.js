const express = require("express");
const {
  createSaloons,
  getSaloons,
  getSaloonss,
  SaloonsPhotoUpload,
  deleteSaloons,
  getSaloonssInRadius,
  getSaloonssPhotos,
} = require("../controllers/Saloons");

const Reviewrouter = require("./Review");
const router = express.Router();
const advancedResults = require("../middleware/advanceResults");
const upload = require("../utils/cloundinaryPhotoupload");
const { protect, authorize } = require("../middleware/auth");
const OrderRouter = require("./Order");
const Saloon = require("../models/Saloons");

router.use("/:saloonid/review", Reviewrouter);
router.use("/:saloonid/order", OrderRouter);
router.route("/:id/photo").post(upload.array("files"), SaloonsPhotoUpload);
router.route("/:id/photo").get(getSaloonssPhotos);
router
  .route("/")
  .get(advancedResults(Saloon), getSaloonss)
  .post(protect, createSaloons);

router.route("/:id").get(getSaloons).delete(deleteSaloons);
router.route("/radius/:lati/:lngi/:distance").get(getSaloonssInRadius);
module.exports = router;
