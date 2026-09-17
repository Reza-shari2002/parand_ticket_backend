const express = require("express");
const iplimiter = require("../../middlewares/Iplimiter");
const checkbody_query = require("../../middlewares/checkbody&query");
const router = express.Router();
const tokenVerify = require("../../middlewares/Tokenverify");
const requireAdmin = require("./middlewares/adminAuth.js");
const validation = require("./admin.validation.js");
const controller = require("./admin.controller");

router.use(express.json());

router.get(
  "/verify-ticket",
  tokenVerify,
  requireAdmin,
  checkbody_query("Verify-ticket", validation.verifyTicket_schema),
  controller.verifyTicket_controller,
);

module.exports = router;
