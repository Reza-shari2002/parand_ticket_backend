const AppError = require("../../config/AppErrore");
const crypto = require("crypto");
const notificationService = require("../notification/notification.service");
const logger = require("../../config/logger");
const reposetory = require("./auth.reposetory");
const user_reposetory = require("../user/user.reposetory");
const generateAccesstoken = require("../../services/token/Accesstoken");
async function sendOtp_service(phone_number) {
  try {
    const otp_code = crypto.randomInt(100000, 1000000).toString();
    const result = await reposetory.insertOtp(phone_number, otp_code);
    //const result2 = await notificationService.sendOtplookup(      phone_number,      otp_code,   );
    return;
  } catch (err) {
    throw err;
  }
}
async function verifyOtp_service( phone_number, otp) {
  try{
    const result = await reposetory.getValidOtp(phone_number,otp);
    if(!result){
      throw new AppError("کد وارد شده اشتباه است یا منقضی شده", 400); //  درست
    }
    await reposetory.markOtpAsUsed(result.id);
    let user =await user_reposetory.findUserByPhone(result.phone);
    if(!user){
     user = await user_reposetory.createUser(result.phone); 
    }

    const accessToken = await generateAccesstoken(user);

    return accessToken;


  }
  catch(err){
    throw(err);
  }
}




module.exports.sendOtp_service = sendOtp_service;
module.exports.verifyOtp_service = verifyOtp_service;