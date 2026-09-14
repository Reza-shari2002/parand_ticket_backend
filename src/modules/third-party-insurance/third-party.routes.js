const express = require("express");
const iplimiter = require("../../middlewares/Iplimiter");
const token_verify = require("../../middlewares/Tokenverify");
const controller = require("./third-party.controller");
const checkpermission = require("./middlewares/checkpermission");
const checkFormdata = require('./middlewares/checkFormdata');
const checkbody_query = require("../../middlewares/checkbody&query");
const validation = require('./third-party.validation');
const verifyRCaptcha = require("../../middlewares/verifyCaptchaRcaptcha");
const validateUploadedFiles = require('./middlewares/validationUploadFiles');

const router = express.Router();
router.use(express.json());

router.get("/", /* iplimiter*/ token_verify, controller.users_form);

router.get("/view", token_verify, controller.viewInsuranceImage);

router.get('/query'  , token_verify , checkbody_query('query' , validation.query_schema)  , controller.users_form_query );

router.get('/filter' , token_verify  ,  checkbody_query('filter' , validation.filter_schema) , controller.filter_forms_controller )
 
router.get(
  "/:form_id"   , /* 

  iplimiter,*/
  token_verify,
  checkpermission,
  controller.user_form,
);

router.post(
  "/",
  iplimiter,
  verifyRCaptcha, checkFormdata,
  checkbody_query("create form",validation.create_form_schema),
  validateUploadedFiles,
  controller.save_data
);

module.exports = router;
