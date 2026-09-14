const express = require("express");
const iplimiter = require("../../middlewares/Iplimiter");
const iplimiterotp = require("./middlewares/ipLimiterotp");
const token_verify = require("../../middlewares/Tokenverify");
const checkbody_query = require("../../middlewares/checkbody&query");
const validation = require("./auth.validation");
const controller = require("./auth.controller");

const router = express.Router();
router.use(express.json());

router.post(
  "/send-otp",
  iplimiterotp,
  checkbody_query("sendOtp", validation.sendOtp_shcema),
  controller.snedOtp_controller
);

router.post(
  "/verify-otp",
  iplimiter,
  checkbody_query("verify-otp", validation.verifyOtp_schema),
  controller.verifyOtp_controller
);

module.exports = router;
