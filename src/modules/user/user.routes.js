const express = require("express");
const iplimiter = require("../../middlewares/Iplimiter");
const checkbody_query = require("../../middlewares/checkbody&query");
const tokenVerify = require("../../middlewares/Tokenverify");
const iplimiterInapp = require("./middlewares/iplimiterInapp");
const validation = require("./user.validation");
const controller = require("./user.controller")
const router = express.Router();

router.use(express.json());

router.get("/me/profile" ,  tokenVerify,iplimiterInapp  , controller.getProfile_controller);

router.patch("/me/profile" , checkbody_query("update_user" ,validation.completeProfileSchema ) ,tokenVerify ,iplimiterInapp  ,controller.completeProfile_controller );


module.exports = router;