const express = require("express");
const {
  createMenu,
  getMenuData,
  getSingleMenuData,
} = require("../controllers/MenuData");

const router = express.Router({ mergeParams: true });

router.route("/").get(getMenuData).post(createMenu);
router.route("/:id").get(getSingleMenuData);

module.exports = router;
