const axios = require("axios");
require("dotenv").config(); 

const axiosInstance = axios.create({
  baseURL: "https://api.kavenegar.com/v1", 
  timeout: 10000,
  headers: {
    "Content-Type": "application/x-www-form-urlencoded",
    Accept: "application/json",
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const apiKey = process.env.KAVENEGAR_API_KEY;
    if (!apiKey) {
      console.error(
        "⚠️ خطای حیاتی: KAVENEGAR_API_KEY در فایل .env تعریف نشده است!",
      );
    }
    config.url = `/${apiKey}/sms${config.url}`;
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);

module.exports = axiosInstance;
