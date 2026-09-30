const paymentService = require("./payment.service");

async function requestPayment_controller(req, res, next) {
  try {
    const { ticketId } = req.body;
    const userId = req.user.id;
    const userPhone = req.user.phone;
    console.log(userPhone);
    const result = await paymentService.requestPayment_service(ticketId, userId, userPhone);

    return res.status(200).json({
      status: "success",
      data: result // شامل { paymentUrl }
    });
  } catch (err) {
    next(err);
  }
}

async function callbackPayment_controller(req, res, next) {
  // گرفتن آدرس فرانت با مقدار پیش‌فرض امن جهت جلوگیری از خطا در صورت نبود env
  const defaultFrontendUrl = process.env.FRONTEND_PAYMENT_RESULT_URL || "https://parandcup.ir/payment/result";

  try {
    const authority = req.query.Authority || req.query.authority;
    const status = req.query.Status || req.query.status;

    if (!authority) {
      // اگر کاربر مستقیم بدون authority وارد لینک کال‌بک شد
      const frontendUrl = new URL(defaultFrontendUrl);
      frontendUrl.searchParams.set("success", "false");
      frontendUrl.searchParams.set("message", "شناسه پرداخت یافت نشد.");
      return res.redirect(frontendUrl.toString());
    }

    const result = await paymentService.handleCallback_service({ authority, status });

    // هدایت نهایی به فرانت‌اند همراه با کوئری‌پارامترها
    const frontendUrl = new URL(defaultFrontendUrl);
    frontendUrl.searchParams.set("success", result.success ? "true" : "false");
    
    if (result.refId) {
      frontendUrl.searchParams.set("refId", String(result.refId));
    }
    if (result.ticketId) {
      frontendUrl.searchParams.set("ticketId", String(result.ticketId));
    }
    if (result.message) {
      frontendUrl.searchParams.set("message", String(result.message));
    }

    return res.redirect(frontendUrl.toString());
  } catch (err) {
    // در صورت بروز خطای داخلی در سرور، کاربر را با پیام خطا به فرانت ریدایرکت می‌کنیم
    try {
      const frontendUrl = new URL(defaultFrontendUrl);
      frontendUrl.searchParams.set("success", "false");
      frontendUrl.searchParams.set("message", "خطای سرور در پردازش بازگشت از درگاه.");
      return res.redirect(frontendUrl.toString());
    } catch (redirectErr) {
      next(err);
    }
  }
}


module.exports = {
  requestPayment_controller,
  callbackPayment_controller
};
