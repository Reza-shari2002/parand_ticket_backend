const db = require("../../config/db");

// ۱. ایجاد تراکنش جدید در وضعیت pending
async function createTransactionRecord({ userId, ticketId, amount, authority }) {
  const sql = `
    INSERT INTO transactions (user_id, ticket_id, amount, authority, status)
    VALUES (?, ?, ?, ?, 'pending')
  `;
  const [result] = await db.query(sql, [userId, ticketId, amount, authority]);
  return result.insertId;
}

// ۲. پیدا کردن تراکنش با authority
async function getTransactionByAuthority(authority, connection = db) {
  const sql = `
    SELECT * FROM transactions 
    WHERE authority = ? 
    LIMIT 1
  `;
  const [rows] = await connection.query(sql, [authority]);
  return rows[0] || null;
}

// ۳. قفل کردن بلیط برای تراکنش (FOR UPDATE)
async function getTicketForPayment(ticketId, connection = db) {
  const sql = `
    SELECT id, user_id, total_amount, status, created_at 
    FROM tickets 
    WHERE id = ? 
    LIMIT 1
    FOR UPDATE
  `;
  const [rows] = await connection.query(sql, [ticketId]);
  return rows[0] || null;
}

// ۴. نهایی‌سازی پرداخت موفق
// ۴. نهایی‌سازی پرداخت موفق
async function finalizeSuccessfulTransaction({ transactionId, ticketId, refId }, connection) {
  // الف) موفقیت تراکنش
  await connection.query(
    `UPDATE transactions SET status = 'success', ref_id = ? WHERE id = ?`,
    [refId, transactionId]
  );

  // ب) پرداخت قطعی بلیط
  await connection.query(
    `UPDATE tickets SET status = 'paid' WHERE id = ?`,
    [ticketId]
  );

  // ج) اشغال قطعی صندلی‌ها (تغییر occupied به sold)
  await connection.query(
    `UPDATE seats SET status = 'sold', locked_at = NULL WHERE ticket_id = ?`,
    [ticketId]
  );
}


// ۵. نهایی‌سازی پرداخت ناموفق یا لغوشده
async function markTransactionAsFailed({ transactionId, ticketId }, connection) {
  await connection.query(
    `UPDATE transactions SET status = 'failed' WHERE id = ?`,
    [transactionId]
  );

  await connection.query(
    `UPDATE tickets SET status = 'failed' WHERE id = ?`,
    [ticketId]
  );

  await connection.query(
    `UPDATE seats SET status = 'available', locked_at = NULL, ticket_id = NULL WHERE ticket_id = ?`,
    [ticketId]
  );
}

async function extendSeatLockTime(ticketId, connection = db) {
  await connection.query(
    `UPDATE seats SET locked_at = NOW() WHERE ticket_id = ?`,
    [ticketId]
  );
}

async function getActiveSeatsCount(ticketId, connection = db) {
  const [rows] = await connection.query(
    `SELECT COUNT(*) as count FROM seats WHERE ticket_id = ? AND status = 'locked'`,
    [ticketId]
  );
  return rows[0].count;
}
module.exports = {
  createTransactionRecord,
  getTransactionByAuthority,
  getTicketForPayment,
  finalizeSuccessfulTransaction,
  markTransactionAsFailed,
  extendSeatLockTime, // اضافه شد
  getActiveSeatsCount, // 
};
