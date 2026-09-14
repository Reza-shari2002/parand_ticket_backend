const axios = require("axios");
require("dotenv").config();
const logger = require("../config/logger");

const verifyRCaptcha = async (req, res, next) => {
  try {
    // طبق کد فرانت‌اند، توکن را از هدر می‌خوانیم (یا اگر در body می‌فرستید، تغییر دهید)
    const token = req.headers["x-captcha-token"];

    if (!token) {
      logger.error("400", {
        message: "no x-captcha-token sent from user",
        ip: req.ip,
      });
      return res.status(400).json({
        success: false,
        message: "لطفاً تایید کنید که ربات نیستید (توکن کپچا یافت نشد)",
      });
    }

    // ساخت بدنه درخواست به صورت JSON (طبق مستندات آرکپچا)
    const response = await axios.post(
      "https://api.arcaptcha.co/arcaptcha/api/verify",
      {
        challenge_id: token, // همان توکن دریافت شده
        site_key: process.env.ARCAPTCHA_SITE_KEY,
        secret_key: process.env.ARCAPTCHA_SECRET_KEY,
      },
      {
        headers: {
          "Content-Type": "application/json", // بسیار مهم
        },
      },
    );

    const data = response.data;

    if (data.success) {
      return next();
    }

    logger.error("403", {
      message: "captcha token invalid",
      ip: req.ip,
      errorCodes: data["error-codes"],
    });

    return res.status(403).json({
      success: false,
      message: "تاییدیه امنیتی (کپچا) نامعتبر است. لطفاً دوباره تلاش کنید.",
      errors: data["error-codes"],
    });
  } catch (error) {
    logger.error("500", {
      message: "can not connect to arcaptcha service",
      ip: req.ip,
      error: error.message,
    });

    return res.status(500).json({
      success: false,
      message:
        "خطا در برقراری ارتباط با سرویس امنیتی. لطفاً لحظاتی دیگر تلاش کنید.",
    });
  }
};

module.exports = verifyRCaptcha;
