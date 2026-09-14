const express = require("express");
const checkbody_query = require("../../middlewares/checkbody&query.js");
const iplimiter = require("../../middlewares/Iplimiter.js");
const validation = require('./notification.validation.js');
const token_verify = require("../../middlewares/Tokenverify.js");
const Controller = require('./notification.controller.js');

const router = express.Router();

router.use(express.json());

router.post(
  "/third-party-insurance/submit",
  iplimiter,
  token_verify,
  checkbody_query("send" , validation.Submit_third_party_insurance_schema),
  Controller.Submit_third_party_insurance,
);

module.exports = router;
