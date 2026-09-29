const express = require("express");
const iplimiterInapp = require("./middlewares/iplimiterInapp");
const checkbody_query = require("../../middlewares/checkbody&query");
const router = express.Router();
const tokenVerify = require("../../middlewares/Tokenverify");
const controller = require("../setting/setting.controller");
const validation = require("./setting.validation.js");
const requireAdmin = require("../admin/middlewares/adminAuth.js");

router.use(express.json());

router.patch(
  "/",
  checkbody_query("update_setting", validation.updateSettingsSchema),
  tokenVerify,
  requireAdmin,
  controller.capacity_controller,
);

router.get(
  "/",
  tokenVerify,
  iplimiterInapp,
  controller.getSettingsPublic_controller,
);
module.exports = router;
