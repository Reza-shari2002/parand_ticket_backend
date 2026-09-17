const AppError = require("../../config/AppErrore");
const db = require("../../config/db");
const logger = require("../../config/logger");

async function searchTicketForGate(searchQuery) {
  const searchTerm = `%${searchQuery.trim()}%`;

  const sql = `
    SELECT 
      t.id AS ticket_id,
      t.ticket_code,
      t.type AS ticket_type,
      t.quantity,
      t.total_amount,
      t.status,
      t.is_used,
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
    WHERE 
      t.ticket_code = ? 
      OR u.phone LIKE ? 
      OR u.national_code LIKE ? 
      OR u.full_name LIKE ?
    GROUP BY t.id, u.id
    ORDER BY t.created_at DESC
  `;

  // برای ticket_code مقدار دقیق و برای بقیه موارد تطبیق جزئی (LIKE) اعمال می‌شود
  const [rows] = await db.query(sql, [searchQuery.trim(), searchTerm, searchTerm, searchTerm]);
  return rows;
}

module.exports = {
  searchTicketForGate
};