const adminRepo = require("./admin.reposetory");
const AppError = require("../../config/AppErrore");

async function verifyTicket_service(searchQuery) {
  if (!searchQuery || !searchQuery.trim()) {
    throw new AppError("لطفاً عبارت جستجو (کد بلیت، شماره موبایل، کدملی یا نام) را ارسال کنید.", 400);
  }

  const rawTickets = await adminRepo.searchTicketForGate(searchQuery);

  // تبدیل ستون JSON seats به آرایه واقعی جاوااسکریپت و حذف مقادیر null
  const tickets = rawTickets.map((ticket) => {
    let seats = typeof ticket.seats === "string" ? JSON.parse(ticket.seats) : ticket.seats;
    seats = Array.isArray(seats) ? seats.filter(Boolean) : [];
    
    return {
      ticket_id: ticket.ticket_id,
      ticket_code: ticket.ticket_code,
      ticket_type: ticket.ticket_type,
      quantity: ticket.quantity,
      total_amount: ticket.total_amount,
      status: ticket.status,
      is_used: Boolean(ticket.is_used), // تبدیل 0 و 1 دیتابیس به true / false
      created_at: ticket.created_at,
      user: {
        user_id: ticket.user_id,
        phone: ticket.phone,
        full_name: ticket.full_name,
        national_code: ticket.national_code
      },
      seats: seats
    };
  });

  return tickets;
}

module.exports = {
  verifyTicket_service
};
