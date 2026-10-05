const db = require("../../config/db");
const refundRepo = require("./refund.reposetory");
const AppError = require("../../config/AppErrore");

function normalizeCardNumber(cardNumber) {
  if (!cardNumber) return cardNumber;
  return String(cardNumber).replace(/[\s-]/g, "");
}

async function createRefundRequest_service(body, user) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const ticket = await refundRepo.getTicketById(connection, body.ticket_id);

    if (!ticket) {
      throw new AppError("این بلیط وجود ندارد", 404);
    }

    // مالکیت بلیت
    if (Number(ticket.user_id) !== Number(user.id)) {
      throw new AppError("شما دسترسی به بلیط ندارید", 403);
    }

    // فقط بلیت پرداخت‌شده
    if (ticket.status !== "paid") {
      throw new AppError("برای این بلیط مبلغی دریافت نکرده اید", 400);
    }

    // (تو DB is_used TINYINT هست)
    if (Number(ticket.is_used) !== 0) {
      throw new AppError("این بلیط استفاده و باطل گردیده است", 400);
    }

    const existing = await refundRepo.getRefundRequestByTicketId(
      connection,
      body.ticket_id,
    );

    if (
      existing &&
      ["pending", "approved", "refunded"].includes(existing.status)
    ) {
      throw new AppError("در خواست شما ثبت گردیده منتظر بررسی جهت بازگشت مبلغ باشید", 409);
    }

    const payload = {
      ticket_id: body.ticket_id,
      phone: user.phone, 
      national_code: body.national_code,
      card_number: normalizeCardNumber(body.card_number),
      full_name: body.full_name?.trim(),
    };

    const result = await refundRepo.insertRefundRequest(connection, payload);

    await connection.commit();

    return {
      id: result.insertId,
      ...payload,
      status: "pending",
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  createRefundRequest_service,
};
