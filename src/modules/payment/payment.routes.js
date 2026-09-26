const express = require("express");
const iplimiter = require("../../middlewares/Iplimiter");
const iplimiterInapp = require("./middlewares/iplimiterInapp");
const ipLimiterCallback = require("./middlewares/IplimiterCallback");
const checkbody_query = require("../../middlewares/checkbody&query");
const router = express.Router();
const tokenVerify = require("../../middlewares/Tokenverify");
const validation = require("./payment.validation");
const controller = require("./payment.controller");

router.use(express.json());

router.post(
  "/request",
  tokenVerify,
  iplimiterInapp,
  checkbody_query("paymentRequest", validation.paymentRequest_schema),
  controller.requestPayment_controller,
);

router.get("/callback",ipLimiterCallback ,  controller.callbackPayment_controller);

module.exports = router;
