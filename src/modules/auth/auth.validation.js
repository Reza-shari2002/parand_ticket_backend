const joi = require('joi');





const sendOtp_shcema = joi.object({phone_number:joi.string().trim().pattern(/^09\d{9}$/).required()});
const verifyOtp_schema  = joi.object({phone_number:joi.string().trim().pattern(/^09\d{9}$/).required()  , otp:joi.string().trim().min(1).max(6).required()})

module.exports.sendOtp_shcema = sendOtp_shcema;
module.exports.verifyOtp_schema = verifyOtp_schema;