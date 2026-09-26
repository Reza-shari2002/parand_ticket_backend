const express = require("express");
const iplimiter = require("../../middlewares/Iplimiter");
const iplimiterInapp = require("./middlewares/iplimiterInapp");
const checkbody_query = require("../../middlewares/checkbody&query");
const router = express.Router();
const tokenVerify = require("../../middlewares/Tokenverify");
const controller = require("./seats.controller");


router.use(express.json());

router.get("/capacity"  , tokenVerify , iplimiterInapp , controller.capacity_controller );

module.exports = router;
