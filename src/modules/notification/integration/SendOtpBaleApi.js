const axios = require("axios");
const crypto = require("crypto");
const logger = require("../../../config/logger"); // مسیر لاگر پروژه‌ات


function normalizePhoneForBale(phone) {
  let cleaned = String(phone).trim().replace(/\D/g, "");
  if (cleaned.startsWith("0")) {
    cleaned = "98" + cleaned.slice(1);
  } else if (!cleaned.startsWith("98")) {
    cleaned = "98" + cleaned;
  }
  return cleaned;
}

/**
 * ارسال کد OTP از طریق وب‌سرویس سفیر بله
 * @param {string} phone شماره موبایل مقصد
 * @param {string|number} otpCode کد یکبار مصرف
 */
async function SendOtpBaleApi(phone, otpCode) {
  const apiKey = process.env.BALE_API_ACCESS_KEY;
  const botId = Number(process.env.BALE_BOT_ID);
  const url = "https://safir.bale.ai/api/v3/send_message";

  if (!apiKey || !botId) {
    throw new Error("تنظیمات بله (BALE_API_ACCESS_KEY یا BALE_BOT_ID) در فایل env تعریف نشده است.");
  }

  const formattedPhone = normalizePhoneForBale(phone);
  const requestId = crypto.randomUUID ? crypto.randomUUID() : `bale_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  const payload = {
    request_id: requestId,
    bot_id: botId,
    phone_number: formattedPhone,
    message_data: {
      otp_message: {
        otp: String(otpCode),
      },
    },
  };

  try {
    const response = await axios.post(url, payload, {
      headers: {
        "Content-Type": "application/json",
        "api-access-key": apiKey,
      },
      timeout: 10000,
    });

    if (response.data?.error_data && response.data.error_data.length > 0) {
      const errItem = response.data.error_data[0];
      const errorMsg = `خطای بله (کد ${errItem.code}): ${errItem.description}`;
      logger.error(`Bale API Error: ${errorMsg}`);
      throw new Error(errorMsg);
    }

    return response.data;
  } catch (error) {
    const errMsg = error.response?.data || error.message;
    logger.error("خطا در ارسال پیام OTP با بله:", errMsg);
    throw error;
  }
}

module.exports = SendOtpBaleApi;
