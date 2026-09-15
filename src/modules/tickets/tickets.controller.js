const ticketsService = require("./tickets.service");

async function reserveTicket_controller(req, res, next) {
  try {
    const userId = req.user.id; // از میدل‌ویر tokenVerify آمده
    const { type, count } = req.ticketData; // از میدل‌ویر checkbody_query آمده

    const result = await ticketsService.reserveTicket_service(userId, { type, count });

    return res.status(201).json({
      status: "success",
      message: "صندلی‌ها با موفقیت به مدت ۱۵ دقیقه برای شما رزرو موقت شدند",
      data: result
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  reserveTicket_controller
};
