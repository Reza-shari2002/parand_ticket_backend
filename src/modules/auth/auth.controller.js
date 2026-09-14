const Services = require("./auth.service");
const logger = require("../../config/logger");

async function snedOtp_controller(req, res, next) {
  try {

    const result = await Services.sendOtp_service(req.phone_number);
    res.status(200).json({ status: "otp sent" });
  } catch (err) {
    next(err);
  }
}

async function verifyOtp_controller(req,res,next) {
  try{
    const accesstoken = await Services.verifyOtp_service(req.phone_number , req.otp);
    res.status(200).json({accesstoken:accesstoken});
  }
  catch(err){
    next(err);
  }
  
}

module.exports.snedOtp_controller = snedOtp_controller;
module.exports.verifyOtp_controller = verifyOtp_controller;