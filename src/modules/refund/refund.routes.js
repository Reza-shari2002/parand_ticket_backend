const express = require("express");
const iplimiterInapp = require("./middlewares/iplimiterInapp");
const checkbody_query = require("../../middlewares/checkbody&query");
const router = express.Router();
const tokenVerify = require("../../middlewares/Tokenverify");
const validation = require("./refund.validation");
const controller = require("./refund.controller");

router.use(express.json());

router.post(
  "/",
  checkbody_query("refund", validation.refundRequestSchema),
  tokenVerify,
  iplimiterInapp ,
  controller.createRefundRequest_controller
);


module.exports = router;
