const db = require("../../config/db");

// ۱. گرفتن صندلی‌ها با اعمال قفل انحصاری (FOR UPDATE)
// صندلی‌هایی که یا Available هستند یا زمان قفل ۱۵ دقیقه‌ایشون منقضی شده
async function getAvailableSeatsForUpdate(connection, type) {
  const sql = `
    SELECT id, seat_number, status, locked_at 
    FROM seats 
    WHERE type = ? 
      AND (
        status = 'available' 
        OR (status = 'locked' AND locked_at < NOW() - INTERVAL 15 MINUTE)
      )
    ORDER BY seat_number ASC
    FOR UPDATE
  `;
  const [rows] = await connection.query(sql, [type]);
  return rows;
}

// ۲. ساخت رکورد بلیط جدید
// tickets.repository.js اصلاح شده
async function createTicket(
  connection,
  {
    userId,
    ticketCode,
    type,
    quantity,
    totalAmount
  }
) {
  const sql = `
    INSERT INTO tickets (
      user_id,
      ticket_code,
      type,
      quantity,
      total_amount,
      status
    )
    VALUES (?, ?, ?, ?, ?, 'pending')
  `;

  const [result] = await connection.query(sql, [
    userId,
    ticketCode,
    type,
    quantity,
    totalAmount
  ]);

  return result.insertId;
}



// ۳. قفل کردن صندلی‌های انتخاب‌شده و اتصال به بلیط
async function lockSeats(connection, seatIds, ticketId) {
  const sql = `
    UPDATE seats 
    SET status = 'locked',
        locked_at = NOW(),
        ticket_id = ?
    WHERE id IN (?)
  `;
  await connection.query(sql, [ticketId, seatIds]);
}

async function lockUserById(connection, userId) {
  const sql = `
    SELECT id
    FROM users
    WHERE id = ?
    FOR UPDATE
  `;

  const [rows] = await connection.query(sql, [userId]);
  return rows[0] || null;
}


async function findPaidTicketByUserAndType(connection, userId, type) {
  const sql = `
    SELECT
      id,
      ticket_code,
      type,
      quantity,
      status,
      created_at
    FROM tickets
    WHERE user_id = ?
      AND type = ?
      AND status = 'paid'
    LIMIT 1
  `;

  const [rows] = await connection.query(sql, [userId, type]);
  return rows[0] || null;
}


async function findPendingTicketsForUpdate(connection, userId, type) {
  const sql = `
    SELECT id
    FROM tickets
    WHERE user_id = ?
      AND type = ?
      AND status = 'pending'
    FOR UPDATE
  `;

  const [rows] = await connection.query(sql, [userId, type]);
  return rows;
}


async function releaseSeatsByTicketIds(connection, ticketIds) {
  if (!ticketIds.length) return;

  const sql = `
    UPDATE seats
    SET
      status = 'available',
      locked_at = NULL,
      ticket_id = NULL
    WHERE ticket_id IN (?)
      AND status = 'locked'
  `;

  await connection.query(sql, [ticketIds]);
}




async function expirePendingTickets(connection, ticketIds) {
  if (!ticketIds.length) return;

  const sql = `
    UPDATE tickets
    SET status = 'expired'
    WHERE id IN (?)
      AND status = 'pending'
  `;

  await connection.query(sql, [ticketIds]);
}




async function expireOldPendingTickets(connection) {
  const sql = `
    UPDATE tickets t
    INNER JOIN seats s ON s.ticket_id = t.id
    SET t.status = 'expired'
    WHERE t.status = 'pending'
      AND s.status = 'locked'
      AND s.locked_at < NOW() - INTERVAL 15 MINUTE
  `;

  await connection.query(sql);
}
module.exports = {
  getAvailableSeatsForUpdate,
  createTicket,
  lockSeats,
  lockUserById,
  findPaidTicketByUserAndType,
  findPendingTicketsForUpdate,
  releaseSeatsByTicketIds,
  expirePendingTickets,
  expireOldPendingTickets
};
