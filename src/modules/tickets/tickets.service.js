const crypto = require("crypto");
const db = require("../../config/db");
const ticketsRepo = require("./tickets.reposetory");
const AppError = require("../../config/AppErrore");
const settingsRepo = require("../setting/setting.reposetory");

const EXPIRATION_MINUTES = Number(process.env.TICKET_EXPIRATION_MINUTES) || 15;


function findConsecutiveSeats(seats, count) {
  if (seats.length < count) return null;

  for (let i = 0; i <= seats.length - count; i++) {
    let isConsecutive = true;
    const selected = [seats[i]];

    for (let j = 1; j < count; j++) {
      // بررسی اینکه شماره صندلی بعدی دقیقاً یکی بیشتر باشه
      if (seats[i + j].seat_number !== seats[i + j - 1].seat_number + 1) {
        isConsecutive = false;
        break;
      }
      selected.push(seats[i + j]);
    }

    if (isConsecutive) {
      return selected;
    }
  }

  return null;
}

async function reserveTicket_service(userId, { type, count }) {
  const connection = await db.getConnection();

  try {
    await connection.beginTransaction();

    const user = await ticketsRepo.lockUserById(connection, userId);

    if (!user) {
      throw new AppError("کاربر یافت نشد", 404);
    }

    await ticketsRepo.expireOldPendingTickets(connection);

    const settings = await settingsRepo.getSettings(connection);

    if (!settings) {
      throw new AppError("تنظیمات سیستم یافت نشد.", 500);
    }

    const priceByType = {
      gamer: settings.gamer_price,
      vip: settings.vip_price,
      regular: settings.regular_price,
    };

    const unitPrice = Number(priceByType[type]);

    if (!Number.isSafeInteger(unitPrice) || unitPrice < 0) {
      throw new AppError("قیمت بلیت معتبر نیست.", 500);
    }

    const paidTicket = await ticketsRepo.findPaidTicketByUserAndType(
      connection,
      userId,
      type,
    );

    if (paidTicket) {
      const typeTitle = {
        gamer: "گیمر",
        vip: "تماشاچی VIP",
        regular: "تماشاچی عادی",
      }[type];

      throw new AppError(
        `کاربر گرامی، شما قبلاً بلیط ${typeTitle} را تهیه کرده‌اید.`,
        409,
      );
    }

    const pendingTickets = await ticketsRepo.findPendingTicketsForUpdate(
      connection,
      userId,
      type,
    );

    const pendingTicketIds = pendingTickets.map((ticket) => ticket.id);

    if (pendingTicketIds.length > 0) {
      await ticketsRepo.releaseSeatsByTicketIds(connection, pendingTicketIds);
      await ticketsRepo.expirePendingTickets(connection, pendingTicketIds);
    }

    const availableSeats = await ticketsRepo.getAvailableSeatsForUpdate(
      connection,
      type,
    );

    // برای گیمر دقیقاً ۱ صندلی، برای بقیه مقدار count در نظر گرفته می‌شود
    const actualQuantity = type === "gamer" ? 1 : count;

    // پیدا کردن صندلی متوالی برای همه انواع (شامل گیمر با ۱ صندلی)
    const selectedSeats = findConsecutiveSeats(availableSeats, actualQuantity);

    if (!selectedSeats) {
      if (type === "gamer") {
        throw new AppError("هیچ جایگاه گیمر آزادی وجود ندارد.", 409);
      } else {
        throw new AppError(
          `${actualQuantity} صندلی متوالی برای این بخش موجود نیست.`,
          409,
        );
      }
    }

    const ticketCode = `TC-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
    const totalAmount = unitPrice * actualQuantity;

    const ticketId = await ticketsRepo.createTicket(connection, {
      userId,
      ticketCode,
      type,
      quantity: actualQuantity,
      totalAmount,
    });

    const seatIds = selectedSeats.map((seat) => seat.id);

    await ticketsRepo.lockSeats(connection, seatIds, ticketId);

    await connection.commit();

    return {
      ticketId,
      ticketCode,
      type,
      quantity: actualQuantity,
      totalAmount,
      seats: selectedSeats.map((seat) => seat.seat_number),
      previousReservationReplaced: pendingTicketIds.length > 0,
      expiresInMinutes: EXPIRATION_MINUTES,
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

async function getTicketById_service(ticketId, userId) {
  const ticket = await ticketsRepo.getTicketById(ticketId);

  if (!ticket) {
    throw new AppError("بلیط مورد نظر یافت نشد.", 404);
  }

  if (ticket.user_id !== userId) {
    throw new AppError("شما اجازه دسترسی به این بلیط را ندارید.", 403);
  }

  const seats = await ticketsRepo.getSeatsByTicketId(ticketId);

  return {
    id: ticket.id,
    ticketCode: ticket.ticket_code,
    type: ticket.type,
    quantity: ticket.quantity,
    totalAmount: ticket.total_amount,
    status: ticket.status,
    seats: seats.map((s) => s.seat_number),
    createdAt: ticket.created_at,
    user: {
      id: ticket.user_id,
      phone: ticket.phone,
      fullName: ticket.full_name,
      nationalCode: ticket.national_code,
    },
  };
}

async function getMyTickets_service(userId) {
  const connection = await db.getConnection();
  try {
    const tickets = await ticketsRepo.getUserPaidTickets(connection, userId);

    return tickets.map((ticket) => ({
      ...ticket,
      seats:
        typeof ticket.seats === "string"
          ? JSON.parse(ticket.seats)
          : ticket.seats || [],
    }));
  } finally {
    connection.release();
  }
}

async function cancelTicket_service(ticketId) {
  const connection = await db.getConnection();
  try {
    await connection.beginTransaction();

    const ticket = await ticketsRepo.getTicketById(ticketId);
    if (!ticket) {
      throw new AppError("بلیط یافت نشد.", 404);
    }

    await ticketsRepo.releaseAllSeatsByTicketId(connection, ticketId);
    await ticketsRepo.updateTicketStatus(connection, ticketId, "expired");

    await connection.commit();
    return {
      success: true,
      message: "بلیط با موفقیت ابطال و صندلی‌ها آزاد شدند.",
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

module.exports = {
  reserveTicket_service,
  getTicketById_service,
  getMyTickets_service,
  cancelTicket_service,
};
