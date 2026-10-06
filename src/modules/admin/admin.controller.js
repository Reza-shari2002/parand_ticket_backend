const adminService = require("./admin.service");
const ticketService = require("../../modules/tickets/tickets.service");
async function verifyTicket_controller(req, res, next) {
  try {
    const { query } = req.query;

    const tickets = await adminService.verifyTicket_service(query);

    return res.status(200).json({
      success: true,
      message:
        tickets.length > 0
          ? "اطلاعات بلیت با موفقیت دریافت شد."
          : "هیچ بلیتی با این مشخصات یافت نشد.",
      data: {
        total_found: tickets.length,
        tickets,
      },
    });
  } catch (error) {
    next(error);
  }
}

async function useTicket_controller(req, res, next) {
  try {
    const id = req.id;

    const result = await adminService.useTicket_service(id);

    return res.status(200).json({
      success: true,
      message: "ورود با موفقیت ثبت شد و بلیت باطل/استفاده گردید.",
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function getAdminTickets_controller(req, res, next) {
  try {
    const page = parseInt(req.filter.page) || 1;
    const limit = parseInt(req.filter.limit) || 20;
    const type = req.filter.type;

    const result = await adminService.getAdminTicketsReport_service({
      page,
      limit,
      type,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function getTransactions_controller(req, res, next) {
  try {
    const page = parseInt(req.filter.page) || 1;
    const limit = parseInt(req.filter.limit) || 20;

    const result = await adminService.getTransactionsReport_service({
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function getUsers_controller(req, res, next) {
  try {
    const { page, limit, search } = req.filter;

    const result = await adminService.getUsersReport_service({
      page: page || 1,
      limit: limit || 20,
      search,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function getOtpLogs_controller(req, res, next) {
  try {
    const page = parseInt(req.filter.page) || 1;
    const limit = parseInt(req.filter.limit) || 20;
    const phone = req.filter.phone;

    // تبدیل امن استرینگ کوئری به boolean اگر ارسال شده باشد
    let is_used;
    if (req.filter.is_used !== undefined && req.filter.is_used !== "") {
      is_used = req.filter.is_used === "true" || req.filter.is_used === true;
    }

    const result = await adminService.getOtpLogsReport_service({
      page,
      limit,
      phone,
      is_used,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function getSeats_controller(req, res, next) {
  try {
    const { page, limit, type, status } = req.filter;

    const result = await adminService.getSeatsReport_service({
      page: page || 1,
      limit: limit || 20,
      type,
      status,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function generateSeats_controller(req, res, next) {
  try {
    const { gamer, vip, regular } = req.body;

    const result = await adminService.generateSeats_service({
      gamer: Number(gamer) || 0,
      vip: Number(vip) || 0,
      regular: Number(regular) || 0,
    });

    return res.status(201).json({
      success: true,
      message: `${result.total_created} صندلی با موفقیت ایجاد شد.`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

async function cancelTicket_controller(req, res, next) {
  try {
    const { id } = req.params; // آیدی بلیط
    const result = await ticketService.cancelTicket_service(id);
    return res.status(200).json({ success: true, message: result.message });
  } catch (error) {
    next(error);
  }
}

async function getRefundRequests_controller(req, res, next) {
  try {
    const page = Number(req.filter.page) || 1;
    const limit = Number(req.filter.limit) || 20;

    const phone = req.filter.phone || "";
    const national_code = req.filter.national_code || "";
    const full_name = req.filter.full_name || "";
    const ticket_id = req.filter.ticket_id;
    const status = req.filter.status || "";

    const result = await adminService.getRefundRequestsReport_service({
      page,
      limit,
      phone,
      national_code,
      full_name,
      ticket_id,
      status,
    });

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
}

module.exports = {
  verifyTicket_controller,
  useTicket_controller,
  getAdminTickets_controller,
  getTransactions_controller,
  getUsers_controller,
  getOtpLogs_controller,
  getSeats_controller,
  generateSeats_controller,
  cancelTicket_controller,
  getRefundRequests_controller
};
