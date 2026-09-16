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
  try {
    const { Authority: authority, Status: status } = req.query;

    const result = await paymentService.handleCallback_service({ authority, status });

    // هدایت نهایی به فرانت‌اند همراه با کوئری‌پارامترها
    const frontendUrl = new URL(process.env.FRONTEND_PAYMENT_RESULT_URL);
    frontendUrl.searchParams.set("success", result.success ? "true" : "false");
    if (result.refId) frontendUrl.searchParams.set("refId", result.refId);
    if (result.ticketId) frontendUrl.searchParams.set("ticketId", result.ticketId);
    if (result.message) frontendUrl.searchParams.set("message", result.message);

    return res.redirect(frontendUrl.toString());
  } catch (err) {
    next(err);
  }
}

module.exports = {
  requestPayment_controller,
  callbackPayment_controller
};
