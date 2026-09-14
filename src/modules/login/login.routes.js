const express = require("express");
const chcekauth = require("./middlewares/checkauth.js");
const checkbody_query = require("../../middlewares/checkbody&query.js");
const validation = require('./login.validation.js');
const iplimiter = require("../../middlewares/Iplimiter.js");
const Controller = require('./login.controller.js');
const router = express.Router();

router.use(express.json());

router.post(
  "/",
  iplimiter,
  checkbody_query("login" , validation.login_schema ),
  chcekauth,
  Controller.login,
);

module.exports = router;