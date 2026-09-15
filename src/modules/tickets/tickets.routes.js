const express = require("express");
const iplimiter = require("../../middlewares/Iplimiter");
const iplimiterInapp = require("./middlewares/iplimiterInapp");
const checkbody_query = require("../../middlewares/checkbody&query");
const router = express.Router();
const tokenVerify = require("../../middlewares/Tokenverify");
const validation = require("./tickets.validation");
const controller = require("./tickets.controller");


router.use(express.json());

router.post("/reserve" , iplimiterInapp,checkbody_query("reserveTicket" , validation.reserveTicket_schema) , tokenVerify , controller.reserveTicket_controller );

module.exports = router;
