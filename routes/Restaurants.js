const express = require("express");
const {
  createRestaurant,
  getRestaurant,
  getRestaurants,
  RestaurantPhotoUpload,
  deleteRestaurant,
  getRestaurantsInRadius,
  getRestaurantsPhotos,
  reqForCreateRestaurant
} = require("../controllers/Restaurants");
const MenuRounter = require("./MenuData");
const Reviewrouter = require("./Review");
const OrderRouter = require("./Order");
const router = express.Router();
const advancedResults = require("../middleware/advanceResults");
const Restaurants = require("../models/Restaurants");
const upload = require("../utils/cloundinaryPhotoupload");
const { authorize,protect } = require("../middleware/auth");

router.use("/:resid/Menu", MenuRounter);
router.use("/:resid/review", Reviewrouter);
router.use("/:resid/order", OrderRouter);
router.route("/:id/photo").post(upload.array("files"), RestaurantPhotoUpload);
router.route("/:id/photo").get(getRestaurantsPhotos);
router
  .route("/")
  .get(
    advancedResults(Restaurants, {
      path: "Menu",
      select: "name meal",
    }),
    getRestaurants
  )
  .post(createRestaurant);
router.post("/reqBusiness",protect,reqForCreateRestaurant)
router.route("/:id").get(getRestaurant).delete(deleteRestaurant);
router.route("/radius/:lati/:lngi/:distance").get(getRestaurantsInRadius);
module.exports = router;
