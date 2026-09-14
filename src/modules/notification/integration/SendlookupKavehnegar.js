const axios = require("axios");
require("dotenv").config();

async function sendOtp(receptor, code) {
  const apiKey = process.env.KAVENEGAR_API_KEY;
  const url = `https://api.kavenegar.com/v1/${apiKey}/verify/lookup.json`;

  try {
    const response = await axios.post(url, null, {
      params: {
        receptor,
        token: code,
        template: "verifyCode", // نام قالب تایید شده شما در پنل
      },
    });
    return response.data;
  } catch (err) {
    // خطای دریافتی از سرور کاوه‌نگار
    const kavenegarError = err.response?.data?.return?.message || err.message;
    throw new Error(kavenegarError);
  }
}

module.exports = sendOtp;
