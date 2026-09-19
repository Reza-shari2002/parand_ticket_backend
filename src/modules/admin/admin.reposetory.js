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
  const [rows] = await db.query(sql, [
    searchQuery.trim(),
    searchTerm,
    searchTerm,
    searchTerm,
  ]);
  return rows;
}

async function getTicketById(ticketId) {
  const sql = `
    SELECT id, ticket_code, status, is_used 
    FROM tickets 
    WHERE id = ?
  `;
  const [rows] = await db.query(sql, [ticketId]);
  return rows[0];
}

// تغییر مقدار is_used به 1
async function markTicketAsUsed(ticketId) {
  const sql = `
    UPDATE tickets 
    SET is_used = 1 
    WHERE id = ? AND is_used = 0
  `;
  const [result] = await db.query(sql, [ticketId]);
  return result.affectedRows;
}

async function getAllPaidTickets({ limit, offset, type }) {
  let whereClauses = ["t.status = 'paid'"];
  let queryParams = [];

  if (type) {
    whereClauses.push("t.type = ?");
    queryParams.push(type);
  }

  const whereSql = whereClauses.join(" AND ");

  // ۱. شمارش کل بلیت‌ها جهت صفحه‌بندی
  const countSql = `
    SELECT COUNT(DISTINCT t.id) AS total
    FROM tickets t
    WHERE ${whereSql}
  `;
  const [[{ total }]] = await db.query(countSql, queryParams);

  // ۲. دریافت داده‌ها به همراه ستون is_used
  const dataSql = `
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
            JSON_OBJECT('seat_id', s.id, 'seat_number', s.seat_number, 'type', s.type), 
            NULL
          )
        ),
        JSON_ARRAY()
      ) AS seats
    FROM tickets t
    INNER JOIN users u ON t.user_id = u.id
    LEFT JOIN seats s ON s.ticket_id = t.id
    WHERE ${whereSql}
    GROUP BY t.id, u.id
    ORDER BY t.created_at DESC
    LIMIT ? OFFSET ?
  `;

  // ارسال پارامترها به کوئری
  const [rows] = await db.query(dataSql, [
    ...queryParams,
    Number(limit),
    Number(offset),
  ]);

  return { total, tickets: rows };
}

async function getAllTransactions({ limit, offset }) {
  // ۱. شمارش کل تراکنش‌ها
  const countSql = `SELECT COUNT(*) AS total FROM transactions`;
  const [[{ total }]] = await db.query(countSql);

  // ۲. دریافت داده‌ها (Join با users و tickets برای گزارش کامل)
  const dataSql = `
    SELECT 
      tr.id,
      tr.amount,
      tr.status,
      tr.authority,
      tr.ref_id,
      tr.created_at,
      u.full_name AS user_name,
      u.phone AS user_phone,
      t.ticket_code
    FROM transactions tr
    INNER JOIN users u ON tr.user_id = u.id
    LEFT JOIN tickets t ON tr.ticket_id = t.id
    ORDER BY tr.created_at DESC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await db.query(dataSql, [Number(limit), Number(offset)]);

  return { total, transactions: rows };
}

async function getAllUsers({ limit, offset, search }) {
  let whereClauses = [];
  let queryParams = [];

  // اضافه کردن شرط جستجو اگر ارسال شده باشد
  if (search) {
    whereClauses.push("(phone LIKE ? OR full_name LIKE ?)");
    queryParams.push(`%${search}%`, `%${search}%`);
  }

  const whereSql =
    whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  // ۱. شمارش کل کاربران (با در نظر گرفتن فیلتر جستجو)
  const countSql = `SELECT COUNT(*) AS total FROM users ${whereSql}`;
  const [[{ total }]] = await db.query(countSql, queryParams);

  // ۲. دریافت داده‌ها
  const dataSql = `
    SELECT id, phone, role, full_name, national_code, created_at
    FROM users
    ${whereSql}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;

  // افزودن پارامترهای صفحه‌بندی
  const [rows] = await db.query(dataSql, [
    ...queryParams,
    Number(limit),
    Number(offset),
  ]);

  return { total, users: rows };
}

async function getAllOtpLogs({ limit, offset, phone, is_used }) {
  let whereClauses = [];
  let queryParams = [];

  // ۱. فیلتر جستجوی شماره تلفن
  if (phone) {
    whereClauses.push("phone LIKE ?");
    queryParams.push(`%${phone}%`);
  }

  // ۲. فیلتر اختیاری وضعیت استفاده شده / نشده
  if (typeof is_used === "boolean") {
    whereClauses.push("is_used = ?");
    queryParams.push(is_used);
  }

  const whereSql =
    whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  // شمارش کل لاگ‌ها بر اساس فیلتر
  const countSql = `SELECT COUNT(*) AS total FROM otp_codes ${whereSql}`;
  const [[{ total }]] = await db.query(countSql, queryParams);

  // واکشی رکوردها با محاسبه وضعیت انقضا
  const dataSql = `
    SELECT 
      id,
      phone,
      code,
      is_used,
      expires_at,
      created_at,
      (expires_at < NOW()) AS is_expired
    FROM otp_codes
    ${whereSql}
    ORDER BY created_at DESC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await db.query(dataSql, [
    ...queryParams,
    Number(limit),
    Number(offset),
  ]);

  return { total, otps: rows };
}

async function getAllSeats({ limit, offset, type, status }) {
  let whereClauses = [];
  let queryParams = [];

  if (type) {
    whereClauses.push("s.type = ?");
    queryParams.push(type);
  }
  if (status) {
    whereClauses.push("s.status = ?");
    queryParams.push(status);
  }

  const whereSql =
    whereClauses.length > 0 ? `WHERE ${whereClauses.join(" AND ")}` : "";

  // ۱. شمارش کل صندلی‌ها
  const countSql = `SELECT COUNT(*) AS total FROM seats s ${whereSql}`;
  const [[{ total }]] = await db.query(countSql, queryParams);

  // ۲. دریافت جزئیات صندلی‌ها و لینک به بلیت
  const dataSql = `
    SELECT 
      s.id,
      s.seat_number,
      s.type,
      s.status,
      s.locked_at,
      s.ticket_id,
      t.ticket_code
    FROM seats s
    LEFT JOIN tickets t ON s.ticket_id = t.id
    ${whereSql}
    ORDER BY s.id ASC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await db.query(dataSql, [
    ...queryParams,
    Number(limit),
    Number(offset),
  ]);

  return { total, seats: rows };
}



// ۱. دریافت بزرگ‌ترین شماره صندلی برای هر نوع صندلی
async function getMaxSeatNumbers() {
  const sql = `
    SELECT type, COALESCE(MAX(seat_number), 0) AS max_number
    FROM seats
    GROUP BY type
  `;
  const [rows] = await db.query(sql);
  
  // تبدیل خروجی به شکل یک آبجکت تمیز: { gamer: 2, vip: 5, regular: 8 }
  const maxMap = { gamer: 0, vip: 0, regular: 0 };
  rows.forEach((r) => {
    maxMap[r.type] = Number(r.max_number);
  });

  return maxMap;
}

// ۲. درج دسته‌ای صندلی‌ها در دیتابیس با یک کوئری
async function bulkInsertSeats(seatsData) {
  if (!seatsData || seatsData.length === 0) return 0;

  // seatsData ساختاری مثل این دارد: [[1, 'gamer', 'available'], [2, 'gamer', 'available'], ...]
  const sql = `INSERT INTO seats (seat_number, type, status) VALUES ?`;
  const [result] = await db.query(sql, [seatsData]);

  return result.affectedRows;
}

module.exports = {
  searchTicketForGate,
  getTicketById,
  markTicketAsUsed,
  getAllPaidTickets,
  getAllTransactions,
  getAllUsers,
  getAllOtpLogs,
  getAllSeats,
  getMaxSeatNumbers ,
  bulkInsertSeats , 
};
