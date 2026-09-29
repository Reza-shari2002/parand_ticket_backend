const rateLimit = require("express-rate-limit");
const logger = require("../../../config/logger");

const VerifyLimiter = rateLimit({
  windowMs: 2 * 60 * 1000, // ۲ دقیقه
  max:10 , // هر شماره تلفن حداکثر ۲ بار در ۲ دقیقه می‌تواند کد بخواهد11
  standardHeaders: true,
  legacyHeaders: false,

  // کلید را شماره تلفن قرار می‌دهیم تا کاربران همراه اول به مشکل نخورند
  keyGenerator: (req) => {
    // شماره را از بدنه درخواست (body) می‌گیریم
    const phone = req?.phone_number;
    if (phone) {
      return `otp_${phone.trim()}`;
    }
    // اگر به هر دلیلی شماره نفرستاده بود، بر اساس IP
    return req.ip;
  },

  validate: {
    keyGeneratorIpFallback: false,
  },

  handler: (req, res) => {
    logger.error(429, {
      ip: req.ip,
      phone: req?.phone_number || null,
      message: "Too many OTP requests",
    });

    return res.status(429).json({
      status: "fail",
      message: "کد تایید اخیراً برای شما ارسال شده است. لطفاً ۲ دقیقه دیگر مجدداً تلاش کنید.",
    });
  },
});

module.exports = VerifyLimiter;
