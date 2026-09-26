const ticketsService = require("./tickets.service");
const EXPIRATION_MINUTES = Number(process.env.TICKET_EXPIRATION_MINUTES) || 15;

async function reserveTicket_controller(req, res, next) {
  try {
    const userId = req.user.id; // از میدل‌ویر tokenVerify آمده
    const { type, count } = req.ticketData; // از میدل‌ویر checkbody_query آمده

    const result = await ticketsService.reserveTicket_service(userId, { type, count });

    return res.status(201).json({
      status: "success",
      message: `صندلی های مورد نظر به مدت ${EXPIRATION_MINUTES} به طور موقت تا پرداخت نهایی برای شما رزرو شدند`,
      data: result
    });
  } catch (err) {
    next(err);
  }
}


async function getTicketById_controller(req, res, next) {
  try {
    const userId = req.user.id;      // از میدل‌ویر tokenVerify
    const ticketId = req.ticketId || req.params.id; // از میدل‌ویر ولیدیشن

    const ticket = await ticketsService.getTicketById_service(ticketId, userId);

    return res.status(200).json({
      status: "success",
      data: ticket
    });
  } catch (err) {
    next(err);
  }
}


async function getMyTickets_controller(req, res, next) {
  try {
    const userId = req.user.id; // شناسه استخراج شده از میدلور توکن

    const tickets = await ticketsService.getMyTickets_service(userId);

    return res.status(200).json({
      success: true,
      data: {
        tickets,
      },
    });
  } catch (error) {
    next(error);
  }
}
module.exports = {
  reserveTicket_controller, 
  getTicketById_controller,
  getMyTickets_controller
};
