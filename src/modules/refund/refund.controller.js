const refundService = require("./refund.service");

async function createRefundRequest_controller(req, res, next) {
  try {
    const data = await refundService.createRefundRequest_service(
      req.body,
      req.user, // از tokenVerify
    );

    return res.status(201).json({
      message: "درخواست استرداد با موفقیت ثبت شد",
      data,
    });
  } catch (error) {
    return next(error);
  }
}

module.exports = {
  createRefundRequest_controller,
};
