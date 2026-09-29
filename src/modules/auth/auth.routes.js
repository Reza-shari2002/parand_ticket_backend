const express = require("express");
const iplimiterotp = require("./middlewares/ipLimiterotp");
const checkbody_query = require("../../middlewares/checkbody&query");
const validation = require("./auth.validation");
const controller = require("./auth.controller");
const VerifyLimiter = require("./middlewares/iplimiterVerify");
const router = express.Router();
router.use(express.json());

router.post(
  "/send-otp",
  checkbody_query("sendOtp", validation.sendOtp_shcema),
  iplimiterotp,
  controller.snedOtp_controller,
);

router.post(
  "/verify-otp",
  checkbody_query("verify-otp", validation.verifyOtp_schema),
  VerifyLimiter,
  controller.verifyOtp_controller,
);

module.exports = router;
