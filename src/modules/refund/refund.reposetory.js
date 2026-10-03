const db = require("../../config/db");

async function getTicketById(connection, ticketId) {
  const sql = `
    SELECT 
      id,
      user_id,
      status,
      is_used
    FROM tickets
    WHERE id = ?
    LIMIT 1
  `;

  const [rows] = await connection.query(sql, [ticketId]);
  return rows[0] || null;
}

async function getRefundRequestByTicketId(connection, ticketId) {
  const sql = `
    SELECT 
      id,
      ticket_id,
      status,
      created_at
    FROM refund_requests
    WHERE ticket_id = ?
    ORDER BY id DESC
    LIMIT 1
  `;

  const [rows] = await connection.query(sql, [ticketId]);
  return rows[0] || null;
}

async function insertRefundRequest(connection, payload) {
  const sql = `
    INSERT INTO refund_requests
      (ticket_id, phone, national_code, iban, card_number, full_name, status)
    VALUES
      (?, ?, ?, ?, ?, ?, 'pending')
  `;

  const values = [
    payload.ticket_id,
    payload.phone,
    payload.national_code,
    payload.iban,
    payload.card_number,
    payload.full_name,
  ];

  const [result] = await connection.query(sql, values);
  return result; // insertId
}

module.exports = {
  getTicketById,
  getRefundRequestByTicketId,
  insertRefundRequest,
};
