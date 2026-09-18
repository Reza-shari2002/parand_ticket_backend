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


async function useTicket_service(ticketId) {
  // ۱. بررسی وجود بلیت
  const ticket = await adminRepo.getTicketById(ticketId);
  if (!ticket) {
    throw new AppError("بلیتی با این شناسه یافت نشد.", 404);
  }

  // ۲. بررسی پرداخت‌شده بودن بلیت
  if (ticket.status !== "paid") {
    throw new AppError("این بلیت پرداخت نشده یا معتبر نیست.", 400);
  }

  // ۳. بررسی استفاده قبلی
  if (ticket.is_used === 1) {
    throw new AppError("این بلیت قبلاً استفاده شده است و امکان ورود مجدد وجود ندارد.", 400);
  }

  // ۴. آپدیت کردن وضعیت
  await adminRepo.markTicketAsUsed(ticketId);

  return {
    ticket_id: ticket.id,
    ticket_code: ticket.ticket_code,
    is_used: true
  };
}

async function getAdminTicketsReport_service({ page, limit, type }) {
  const offset = (page - 1) * limit;
  const { total, tickets: rawTickets } = await adminRepo.getAllPaidTickets({ limit, offset, type });

  const tickets = rawTickets.map((t) => {
    let seats = typeof t.seats === "string" ? JSON.parse(t.seats) : t.seats;
    seats = Array.isArray(seats) ? seats.filter(Boolean) : [];

    return {
      ticket_id: t.ticket_id,
      ticket_code: t.ticket_code,
      ticket_type: t.ticket_type,
      quantity: t.quantity,
      total_amount: t.total_amount,
      status: t.status,
      is_used: Boolean(t.is_used),
      created_at: t.created_at,
      user: {
        user_id: t.user_id,
        phone: t.phone,
        full_name: t.full_name,
        national_code: t.national_code
      },
      seats
    };
  });

  return {
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    },
    tickets
  };
}


async function getTransactionsReport_service({ page, limit }) {
  const offset = (page - 1) * limit;
  const { total, transactions } = await adminRepo.getAllTransactions({ limit, offset });

  return {
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    },
    transactions
  };
}

async function getUsersReport_service({ page, limit, search }) {
  const offset = (page - 1) * limit;
  const { total, users } = await adminRepo.getAllUsers({ limit, offset, search });

  return {
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    },
    users
  };
}


async function getOtpLogsReport_service({ page, limit, phone, is_used }) {
  const offset = (page - 1) * limit;
  const { total, otps: rawOtps } = await adminRepo.getAllOtpLogs({ 
    limit, 
    offset, 
    phone, 
    is_used 
  });

  const otps = rawOtps.map((otp) => ({
    id: otp.id,
    phone: otp.phone,
    code: otp.code,
    is_used: Boolean(otp.is_used),
    is_expired: Boolean(otp.is_expired),
    expires_at: otp.expires_at,
    created_at: otp.created_at
  }));

  return {
    pagination: {
      total,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(total / limit)
    },
    otps
  };
}



module.exports = {
  verifyTicket_service , 
  useTicket_service  , 
  getAdminTicketsReport_service ,
  getTransactionsReport_service , 
  getUsersReport_service , 
  getOtpLogsReport_service 
};
