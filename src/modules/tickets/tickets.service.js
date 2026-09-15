const crypto = require("crypto");
const db = require("../../config/db");
const ticketsRepo = require("./tickets.reposetory");
const AppError = require("../../config/AppErrore");

// قیمت‌گذاری پایه بر اساس نوع (تومان) - این مقادیر رو بر اساس سیاست خودت تنظیم کن
const TICKET_PRICES = {
  gamer: 150000,
  vip: 100000,
  regular: 50000
};

// تابع کمکی پیدا کردن صندلی‌های متوالی
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

    const user = await ticketsRepo.lockUserById(
      connection,
      userId
    );

    if (!user) {
      throw new AppError("کاربر یافت نشد", 404);
    }

    await ticketsRepo.expireOldPendingTickets(connection);

    const paidTicket =
      await ticketsRepo.findPaidTicketByUserAndType(
        connection,
        userId,
        type
      );

    if (paidTicket) {
      const typeTitle = {
        gamer: "گیمر",
        vip: "تماشاچی VIP",
        regular: "تماشاچی عادی"
      }[type];

      throw new AppError(
        `کاربر گرامی، شما قبلاً بلیط ${typeTitle} را تهیه کرده‌اید.`,
        409
      );
    }

    const pendingTickets =
      await ticketsRepo.findPendingTicketsForUpdate(
        connection,
        userId,
        type
      );

    const pendingTicketIds = pendingTickets.map(
      ticket => ticket.id
    );

    if (pendingTicketIds.length > 0) {
      await ticketsRepo.releaseSeatsByTicketIds(
        connection,
        pendingTicketIds
      );

      await ticketsRepo.expirePendingTickets(
        connection,
        pendingTicketIds
      );
    }

    const availableSeats =
      await ticketsRepo.getAvailableSeatsForUpdate(
        connection,
        type
      );

    let selectedSeats;
    const actualQuantity = type === "gamer" ? 1 : count;

    if (type === "gamer") {
      if (availableSeats.length === 0) {
        throw new AppError(
          "هیچ جایگاه گیمر آزادی وجود ندارد",
          409
        );
      }

      selectedSeats = [availableSeats[0]];
    } else {
      selectedSeats = findConsecutiveSeats(
        availableSeats,
        actualQuantity
      );

      if (!selectedSeats) {
        throw new AppError(
          `${actualQuantity} صندلی متوالی برای این بخش موجود نیست.`,
          409
        );
      }
    }

    const ticketCode = `TC-${crypto.randomInt(
      100000,
      1000000
    )}`;

    const totalAmount =
      TICKET_PRICES[type] * actualQuantity;

    const ticketId = await ticketsRepo.createTicket(connection, {
      userId,
      ticketCode,
      type,
      quantity: actualQuantity,
      totalAmount
    });

    const seatIds = selectedSeats.map(seat => seat.id);

    await ticketsRepo.lockSeats(
      connection,
      seatIds,
      ticketId
    );

    await connection.commit();

    return {
      ticketId,
      ticketCode,
      type,
      quantity: actualQuantity,
      totalAmount,
      seats: selectedSeats.map(
        seat => seat.seat_number
      ),
      previousReservationReplaced:
        pendingTicketIds.length > 0,
      expiresInMinutes: 15
    };
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}



module.exports = {
  reserveTicket_service
};
