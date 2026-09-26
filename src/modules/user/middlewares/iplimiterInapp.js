const rateLimit = require("express-rate-limit");
const logger = require("../../../config/logger");

const ipLimiterInapp = rateLimit({
  windowMs: 3 * 60 * 1000, // ۳ دقیقه
  max: 150, // سقف مجاز
  standardHeaders: true,
  legacyHeaders: false,

  // کلید اختصاصی برای کاربر لاگین‌شده
  keyGenerator: (req) => {
    if (req.user && req.user.id) {
      return `user_${req.user.id}`;
    }
    // اگر لاگین نبود، از تابع استاندارد خود پکیج برای IP استفاده می‌کنیم
    return req.ip;
  },

  // خاموش کردن این ارور سخت‌گیرانه برای حالت فال‌بک IP
  validate: {
    keyGeneratorIpFallback: false,
    xForwardedForHeader: false, // اگر پشت پراکسی هستید خطای هدر ندهد
  },

  handler: (req, res) => {
    logger.error(429, {
      ip: req.ip,
      userId: req.user?.id || null,
      message: "Too many requests",
    });
    return res.status(429).json({
      status: "fail",
      message: "تعداد درخواست‌های شما بیش از حد مجاز است، لطفاً کمی بعد تلاش کنید.",
    });
  },
});

module.exports = ipLimiterInapp;
