const adminService = require("./admin.service");

async function verifyTicket_controller(req, res, next) {
  try {
    const { query } = req.query;

    const tickets = await adminService.verifyTicket_service(query);

    return res.status(200).json({
      success: true,
      message: tickets.length > 0 ? "اطلاعات بلیت با موفقیت دریافت شد." : "هیچ بلیتی با این مشخصات یافت نشد.",
      data: {
        total_found: tickets.length,
        tickets
      }
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  verifyTicket_controller
};
