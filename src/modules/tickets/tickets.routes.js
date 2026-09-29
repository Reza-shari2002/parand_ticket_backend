const express = require("express");
const iplimiter = require("../../middlewares/Iplimiter");
const iplimiterInapp = require("./middlewares/iplimiterInapp");
const checkTicketAvailability = require("./middlewares/checkTicketAvailability");
const checkbody_query = require("../../middlewares/checkbody&query");
const router = express.Router();
const tokenVerify = require("../../middlewares/Tokenverify");
const validation = require("./tickets.validation");
const controller = require("./tickets.controller");

router.use(express.json());

router.post(
  "/reserve",
  checkbody_query("reserveTicket", validation.reserveTicket_schema),
  tokenVerify,
  iplimiterInapp,
  checkTicketAvailability,
  controller.reserveTicket_controller,
);
router.get(
  "/my-tickets",

  tokenVerify,
  iplimiterInapp,
  controller.getMyTickets_controller,
);

router.get(
  "/:id",

  checkbody_query("viewTicket", validation.getTicketById_schema),
  tokenVerify,
  iplimiterInapp,
  controller.getTicketById_controller,
);

module.exports = router;
