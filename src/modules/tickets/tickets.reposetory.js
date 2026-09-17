const db = require("../../config/db");
const EXPIRATION_MINUTES = Number(process.env.TICKET_EXPIRATION_MINUTES) || 15;

// ۱. گرفتن صندلی‌ها با اعمال قفل انحصاری (FOR UPDATE)
// صندلی‌هایی که یا Available هستند یا زمان قفل ۱۵ دقیقه‌ایشون منقضی شده
async function getAvailableSeatsForUpdate(connection, type, expirationMinutes = EXPIRATION_MINUTES) {
  const sql = `
    SELECT id, seat_number, status, locked_at 
    FROM seats 
    WHERE type = ? 
      AND (
        status = 'available' 
        OR (status = 'locked' AND locked_at < NOW() - INTERVAL ? MINUTE)
      )
    ORDER BY seat_number ASC
    FOR UPDATE
  `;
  // مقدار expirationMinutes به عنوان پارامتر دوم ارسال می‌شود
  const [rows] = await connection.query(sql, [type, expirationMinutes]);
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




async function expireOldPendingTickets(connection, expirationMinutes = EXPIRATION_MINUTES) {
  const sql = `
    UPDATE seats s
    INNER JOIN tickets t ON s.ticket_id = t.id
    SET s.status = 'available',
        s.locked_at = NULL,
        s.ticket_id = NULL,
        t.status = 'expired'
    WHERE t.status = 'pending'
      AND s.status = 'locked'
      AND s.locked_at < NOW() - INTERVAL ? MINUTE
  `;
  await connection.query(sql, [expirationMinutes]);
}



// دریافت اطلاعات اصلی بلیط
async function getTicketById(ticketId) {
  const sql = `
    SELECT 
      t.id,
      t.user_id,
      t.ticket_code,
      t.type,
      t.quantity,
      t.total_amount,
      t.status,
      t.created_at,
      -- اطلاعات کاربر
      u.phone,
      u.full_name,
      u.national_code
    FROM tickets t
    INNER JOIN users u ON t.user_id = u.id
    WHERE t.id = ?
    LIMIT 1
  `;
  const [rows] = await db.query(sql, [ticketId]);
  return rows[0] || null;
}

// دریافت لیست شماره صندلی‌های متصل به این بلیط
async function getSeatsByTicketId(ticketId) {
  const sql = `
    SELECT seat_number, status
    FROM seats
    WHERE ticket_id = ?
    ORDER BY seat_number ASC
  `;
  const [rows] = await db.query(sql, [ticketId]);
  return rows;
}

async function getUserPaidTickets(connection, userId) {
  const [rows] = await connection.query(
    `
      SELECT 
        t.id AS ticket_id,
        t.ticket_code,
        t.type,
        t.quantity,
        t.total_amount,
        t.status,
        t.created_at,
        u.id AS user_id,
        u.phone,
        u.full_name,
        u.national_code,
        COALESCE(
          JSON_ARRAYAGG(
            IF(s.id IS NOT NULL, 
              JSON_OBJECT(
                'seat_id', s.id,
                'seat_number', s.seat_number,
                'type', s.type
              ), 
              NULL
            )
          ),
          JSON_ARRAY()
        ) AS seats
      FROM tickets t
      INNER JOIN users u ON t.user_id = u.id
      LEFT JOIN seats s ON s.ticket_id = t.id
      WHERE t.user_id = ? AND t.status = 'paid'
      GROUP BY t.id, u.id
      ORDER BY t.created_at DESC
    `,
    [userId]
  );

  return rows;
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
  expireOldPendingTickets,
  getTicketById,
  getSeatsByTicketId , 
  getUserPaidTickets
};
