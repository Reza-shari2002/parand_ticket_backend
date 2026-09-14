const axios = require("axios");
require("dotenv").config();
const logger = require("../config/logger");

const verifyCaptcha = async (req, res, next) => {
  try {
    const token = req.headers["x-captcha-token"];
    if (!token) {
      logger.error("400", {
        message: "no  x-captcha token sent from  user",
        ip: req.ip,
      });
      return res.status(400).json({
        success: false,
        message: "لطفاً تایید کنید که ربات نیستید (توکن کپچا یافت نشد)",
      });
    }
    const body = new URLSearchParams();
    body.append("secret", process.env.TURNSTILE_SECRET_KEY);
    body.append("response", token);

    const response = await axios.post(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      body,
      {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      },
    );

    const data = response.data;

    if (data.success) return next();
    logger.error("403", { message: "captcha token invalid", ip: req.ip });
    return res.status(403).json({
      success: false,
      message: "تاییدیه امنیتی (کپچا) نامعتبر است. لطفاً دوباره تلاش کنید.",
      errors: data["error-codes"],
    });
  } catch (error) {
    logger.error("500", {
      message: "can not connect to cloudflare service",
      ip: req.ip,
    });
    return res.status(500).json({
      success: false,
      message:
        "خطا در برقراری ارتباط با سرویس امنیت. لطفاً لحظاتی دیگر تلاش کنید.",
    });
  }
};

module.exports = verifyCaptcha;
