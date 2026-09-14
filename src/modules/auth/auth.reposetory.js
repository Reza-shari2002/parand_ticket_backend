const AppError = require("../../config/AppErrore");
const db = require("../../config/db");
const logger = require("../../config/logger");


async function insertOtp(phone_number, otpcode) {
  try {
    // ۱. باطل کردن تمام کدهای فعال قبلی این شماره تلفن
    const invalidateQuery = `
      UPDATE otp_codes 
      SET is_used = true 
      WHERE phone = ? AND is_used = false
    `;
    await db.query(invalidateQuery, [phone_number]);

    // ۲. درج کد جدید با اعتبار ۲ دقیقه‌ای
    const insertQuery = `
      INSERT INTO otp_codes (phone, code, expires_at) 
      VALUES (?, ?, DATE_ADD(NOW(), INTERVAL 2 MINUTE))
    `;
    const [result] = await db.query(insertQuery, [phone_number, otpcode]);

    return result;
  } catch (err) {
      
    logger.error("Database error in insertOtp:", err.message);
    throw new AppError("Database error in insertOtp" , 500);
  }
}


async function getValidOtp(phone, code) {
  try{  const sql = `
    SELECT * FROM otp_codes 
    WHERE phone = ? AND code = ? AND is_used = FALSE AND expires_at > NOW()
    ORDER BY id DESC LIMIT 1
  `;
   const [rows] = await db.query(sql, [phone, code]);
  return rows[0];
     }
  catch(err){
    logger.error("Database error in insertOtp:", err.message);
    throw(new AppError("server error" , 500));
  }

}
async function markOtpAsUsed(otpId) {
  try{
   const sql = `UPDATE otp_codes SET is_used = TRUE WHERE id = ?`;
   await db.query(sql, [otpId]);
  }
  catch(err){
    logger.error("Database error in insertOtp:", err.message);
    throw(new AppError("server error" , 500));
  }

}



module.exports.insertOtp = insertOtp;
module.exports.getValidOtp = getValidOtp;
module.exports.markOtpAsUsed = markOtpAsUsed;