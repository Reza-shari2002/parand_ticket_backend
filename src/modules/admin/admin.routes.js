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

router.patch(
  "/tickets/:id/cancel",
  tokenVerify,
  requireAdmin,
  checkbody_query("cancelTicket", validation.getTicketById_schema),
  controller.cancelTicket_controller,
);

router.patch(
  "/ticket/:id/use",
  tokenVerify,
  requireAdmin,
  checkbody_query("useTicket", validation.getTicketById_schema),
  controller.useTicket_controller,
);

router.get(
  "/tickets",
  tokenVerify,
  requireAdmin,
  checkbody_query("allTickets", validation.getAdminTickets_schema),
  controller.getAdminTickets_controller,
);

router.get(
  "/transactions",
  tokenVerify,
  requireAdmin,
  checkbody_query("allTransaction", validation.getTransactions_schema),
  controller.getTransactions_controller,
);

router.get(
  "/users",
  tokenVerify,
  requireAdmin,
  checkbody_query("allUsers", validation.getUsers_schema),
  controller.getUsers_controller,
);

router.get(
  "/otp-logs",
  tokenVerify,
  requireAdmin,
  checkbody_query("allOtp", validation.getOtpLogs_schema),
  controller.getOtpLogs_controller,
);

router.post(
  "/seats/generate",
  tokenVerify,
  requireAdmin,
  checkbody_query("generateSeats", validation.generateSeats_schema),
  controller.generateSeats_controller,
);

router.get(
  "/seats",
  tokenVerify,
  requireAdmin,
  checkbody_query("allSeats", validation.getSeats_schema),
  controller.getSeats_controller,
);

router.get(
  "/refund-requests",
  tokenVerify,
  requireAdmin,
  checkbody_query("allRefundRequests", validation.getRefundRequests_schema),
  controller.getRefundRequests_controller,
);

module.exports = router;
