const rateLimit = require("express-rate-limit");

const callbackLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // هر ۱ دقیقه
  max: 60, // هر IP در یک دقیقه تا ۶۰ بار مجاز است (برای پوشش IP اشتراکی موبایل)
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    // به جای ارسال خطای خام 429 JSON، کاربر را با پیام خطا به فرانت ریدایرکت کن
    const frontendUrl = new URL(process.env.FRONTEND_PAYMENT_RESULT_URL);
    frontendUrl.searchParams.set("success", "false");
    frontendUrl.searchParams.set("message", "تعداد درخواست‌های شما بیش از حد مجاز است. لطفاً چند لحظه بعد تلاش کنید.");
    return res.redirect(frontendUrl.toString());
  }
});

module.exports = callbackLimiter;